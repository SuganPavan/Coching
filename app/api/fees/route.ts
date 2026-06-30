import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Fee from "@/models/Fee";
import Student from "@/models/Student";
import { auth } from "@/auth";
import { generateReceiptNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  const query: Record<string, unknown> = {};
  if (studentId) query.studentId = studentId;

  const fees = await Fee.find(query).populate("studentId", "name rollNo class").sort({ paymentDate: -1 }).lean();
  return NextResponse.json(fees);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await req.json();
  const { studentId, amount, paymentMethod, month, remarks } = body;

  if (!studentId || !amount || !paymentMethod || !month) {
    return NextResponse.json({ error: "studentId, amount, paymentMethod, and month are required" }, { status: 400 });
  }

  try {
    const fee = await Fee.create({
      studentId,
      amount: Number(amount),
      paymentMethod,
      month,
      remarks,
      receiptNumber: generateReceiptNumber(),
      collectedBy: (session.user as { id?: string })?.id,
    });

    // Recompute Student.feesPaid from the actual Fee ledger sum.
    // Using $inc can drift if:
    //   - the seed pre-set feesPaid independently of Fee records
    //   - a payment is deleted or corrected directly in the DB
    //   - the same student has multiple payment sources (cash + Razorpay)
    // Summing all Fee records for this student is always the ground truth.
    const ledgerAgg = await Fee.aggregate([
      { $match: { studentId: fee.studentId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalPaidFromLedger = ledgerAgg[0]?.total || 0;

    await Student.findByIdAndUpdate(studentId, { feesPaid: totalPaidFromLedger });

    return NextResponse.json(fee, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
