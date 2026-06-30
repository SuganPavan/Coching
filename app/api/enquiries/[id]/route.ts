import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import { auth } from "@/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();
  const body = await req.json();

  try {
    const enquiry = await Enquiry.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    return NextResponse.json(enquiry);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update enquiry";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const enquiry = await Enquiry.findByIdAndDelete(id);
  if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  return NextResponse.json({ message: "Enquiry deleted" });
}
