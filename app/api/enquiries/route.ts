import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const query: Record<string, unknown> = status ? { status } : {};
  const enquiries = await Enquiry.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(enquiries);
}

// Public route - no auth required, this is the enquiry form on the public website
export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { name, phone, class: studentClass, message } = body;

  if (!name || !phone || !studentClass) {
    return NextResponse.json({ error: "Name, phone, and class are required" }, { status: 400 });
  }

  try {
    const enquiry = await Enquiry.create({ name, phone, class: studentClass, message });
    return NextResponse.json(enquiry, { status: 201 });
  } catch (error: unknown) {
    const message_ = error instanceof Error ? error.message : "Failed to submit enquiry";
    return NextResponse.json({ error: message_ }, { status: 400 });
  }
}
