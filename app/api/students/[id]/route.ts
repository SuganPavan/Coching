import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();
  const student = await Student.findById(id).lean();
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();
  const body = await req.json();

  // feesPaid must never be set directly through this endpoint. It is
  // derived from the Fee ledger (see lib/data.ts / POST /api/fees /
  // /api/razorpay/verify) and recomputed there on every payment. Accepting
  // it here would let a stale or edited value silently overwrite the
  // ledger-accurate total, causing "Fees Collected" to drift from reality.
  // isActive is likewise excluded — deactivation goes through DELETE only.
  const { feesPaid: _feesPaid, isActive: _isActive, ...safeBody } = body;

  try {
    const student = await Student.findByIdAndUpdate(id, safeBody, { new: true, runValidators: true });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update student";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  // Soft delete - preserve historical fee/attendance records
  const student = await Student.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  return NextResponse.json({ message: "Student deactivated", student });
}
