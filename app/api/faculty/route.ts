import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Faculty from "@/models/Faculty";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("activeOnly") !== "false";

  const query: Record<string, unknown> = activeOnly ? { isActive: true } : {};
  const faculty = await Faculty.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(faculty);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await req.json();

  try {
    const faculty = await Faculty.create(body);
    return NextResponse.json(faculty, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add faculty";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
