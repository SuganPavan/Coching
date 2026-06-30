import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("activeOnly") !== "false";

  const query: Record<string, unknown> = activeOnly ? { isActive: true } : {};
  const courses = await Course.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await req.json();

  try {
    const course = await Course.create(body);
    return NextResponse.json(course, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add course";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
