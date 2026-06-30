import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Faculty from "@/models/Faculty";
import { auth } from "@/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();
  const body = await req.json();

  try {
    const faculty = await Faculty.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!faculty) return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    return NextResponse.json(faculty);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update faculty";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const faculty = await Faculty.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!faculty) return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
  return NextResponse.json({ message: "Faculty removed", faculty });
}
