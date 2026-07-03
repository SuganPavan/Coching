import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Fee from "@/models/Fee";
import Student from "@/models/Student";
import { auth } from "@/auth";
import { generateReceiptNumber } from "@/lib/utils";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId, amount, month } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
  }

  // CRITICAL: verify the HMAC signature server-side. Never trust the client callback alone —
  // a forged success response could otherwise be used to mark a fee as paid without payment.
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // CRITICAL: the signature above only proves order_id+payment_id are an
  // authentic Razorpay-issued pair — it does NOT cover `amount`, which
  // otherwise comes straight from the client request body. Without this
  // check, a tampered request could reuse a valid signature from a small
  // real payment alongside a fabricated, much larger `amount`, and that
  // fabricated figure would be written straight into the Fee ledger.
  // Fetching the order from Razorpay gives the authoritative amount to
  // compare against.
  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const expectedPaise = Math.round(Number(amount) * 100);
    if (order.amount !== expectedPaise || order.notes?.studentId !== studentId) {
      return NextResponse.json({ error: "Payment amount or student mismatch" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Could not verify payment order" }, { status: 400 });
  }

  await dbConnect();

  try {
    const fee = await Fee.create({
      studentId,
      amount: Number(amount),
      paymentMethod: "razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      receiptNumber: generateReceiptNumber(),
      month: month || new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }),
    });

    // Recompute from ledger — same pattern as the cash payment route
    const ledgerAgg = await Fee.aggregate([
      { $match: { studentId: fee.studentId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalPaidFromLedger = ledgerAgg[0]?.total || 0;
    await Student.findByIdAndUpdate(studentId, { feesPaid: totalPaidFromLedger });

    return NextResponse.json({ success: true, fee }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
