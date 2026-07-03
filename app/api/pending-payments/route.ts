import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PendingPayment from "@/models/PendingPayment";
import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Public route — this is what the /pay-fees page submits to. No auth,
// since parents/students filling this out are never logged in.
export async function POST(req: NextRequest) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Payment submission is temporarily unavailable. Please call the academy to confirm your payment." },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();

    const name = (formData.get("name") as string || "").trim();
    const phone = (formData.get("phone") as string || "").trim();
    const studentClass = (formData.get("studentClass") as string || "").trim();
    const admissionNumber = (formData.get("admissionNumber") as string || "").trim();
    const userType = formData.get("userType") as string;
    const amount = Number(formData.get("amount"));
    const utr = (formData.get("utr") as string || "").trim();
    const screenshot = formData.get("screenshot") as File | null;

    if (!name || !/^\d{10}$/.test(phone) || !studentClass) {
      return NextResponse.json({ error: "Name, a valid 10-digit phone number, and class are required" }, { status: 400 });
    }
    if (!["existing", "new"].includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }
    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
    }
    if (!utr) {
      return NextResponse.json({ error: "UTR / Transaction ID is required" }, { status: 400 });
    }
    if (!screenshot) {
      return NextResponse.json({ error: "Payment screenshot is required" }, { status: 400 });
    }
    if (screenshot.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Screenshot too large. Maximum size is 5 MB." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(screenshot.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed." }, { status: 400 });
    }

    const bytes = await screenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploaded = await uploadToCloudinary(buffer, "payment-proofs");

    await dbConnect();
    const payment = await PendingPayment.create({
      name,
      phone,
      studentClass,
      admissionNumber: admissionNumber || undefined,
      userType,
      amount,
      utr,
      screenshotUrl: uploaded.secure_url,
      screenshotPublicId: uploaded.public_id,
      status: "pending",
    });

    return NextResponse.json({ id: payment._id }, { status: 201 });
  } catch (error: unknown) {
    console.error("[PendingPayments] submission failed:", error);
    const message = error instanceof Error ? error.message : "Failed to submit payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Admin-only — the review queue at /admin/fees/pending-payments.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const query: Record<string, unknown> = status ? { status } : {};
  const payments = await PendingPayment.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(payments);
}
