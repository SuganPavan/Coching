import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Gallery from "@/models/Gallery";
import { auth } from "@/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const image = await Gallery.findById(id);
  if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  try {
    await deleteFromCloudinary(image.publicId);
  } catch {
    // Continue even if Cloudinary deletion fails (e.g. already removed) - don't block DB cleanup
  }

  await Gallery.findByIdAndDelete(id);
  return NextResponse.json({ message: "Image deleted" });
}
