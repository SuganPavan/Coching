import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Gallery from "@/models/Gallery";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const query: Record<string, unknown> = category ? { category } : {};
  const images = await Gallery.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(images);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await req.json();

  try {
    const image = await Gallery.create({
      ...body,
      uploadedBy: (session.user as { id?: string })?.id,
    });
    return NextResponse.json(image, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add image";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
