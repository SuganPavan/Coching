import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import { auth } from "@/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();
  const body = await req.json();

  try {
    const course = await Course.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    return NextResponse.json(course);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update course";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const course = await Course.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json({ message: "Course removed", course });
}
