import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const studentClass = searchParams.get("class");

  if (!date || !studentClass) {
    return NextResponse.json({ error: "date and class are required" }, { status: 400 });
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const record = await Attendance.findOne({
    class: studentClass,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  return NextResponse.json(record || null);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await req.json();
  const { date, class: studentClass, records } = body;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // Upsert: one document per class per day
    const attendance = await Attendance.findOneAndUpdate(
      { class: studentClass, date: { $gte: startOfDay, $lte: endOfDay } },
      {
        date: new Date(date),
        class: studentClass,
        records,
        markedBy: (session.user as { id?: string })?.id,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(attendance, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save attendance";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
