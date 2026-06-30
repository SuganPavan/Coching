import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Fee from "@/models/Fee";
import Student from "@/models/Student";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const student = await Student.findById(id).lean();
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const fees = await Fee.find({ studentId: id }).sort({ paymentDate: -1 }).lean();

  return NextResponse.json({ student, fees });
}
