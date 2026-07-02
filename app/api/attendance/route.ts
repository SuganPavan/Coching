import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { auth } from "@/auth";
import { getUTCDayBounds } from "@/lib/utils";
import { sendSMS, buildAbsentMessage } from "@/lib/sms";

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

  try {
    const { start, end } = getUTCDayBounds(date);

    const record = await Attendance.findOne({
      class: studentClass,
      date: { $gte: start, $lt: end },
    }).lean();

    // Always return 200 with null when no record exists for this date.
    // The client checks data?.records to decide whether to apply saved
    // statuses or fall back to all-present defaults.
    return NextResponse.json(record ?? null, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load attendance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const body = await req.json();
  const { date, class: studentClass, records } = body;

  if (!date || !studentClass || !Array.isArray(records)) {
    return NextResponse.json(
      { error: "date, class, and records are required" },
      { status: 400 }
    );
  }

  try {
    const { start, end } = getUTCDayBounds(date);

    // Load any existing attendance for this class+day BEFORE upserting.
    // We use this to:
    //   1. Detect which students are newly absent (vs already marked absent
    //      in a previous save) so we only SMS parents once per absence.
    //   2. Avoid sending SMS on re-saves / corrections.
    const existing = await Attendance.findOne({
      class: studentClass,
      date: { $gte: start, $lt: end },
    }).lean();

    // Build a set of studentIds that were ALREADY marked absent in a
    // previous save for this class+day. We will not re-send SMS for these.
    const alreadyAbsentIds = new Set<string>(
      (existing?.records ?? [])
        .filter((r) => r.status === "absent")
        .map((r) => r.studentId.toString())
    );

    // Upsert: one attendance document per class per day.
    const attendance = await Attendance.findOneAndUpdate(
      { class: studentClass, date: { $gte: start, $lt: end } },
      {
        date: start,
        class: studentClass,
        records,
        markedBy: (session.user as { id?: string })?.id,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Find students who are absent in THIS save but were NOT absent before.
    // These are the only ones whose parents need a notification.
    const newlyAbsentIds = records
      .filter(
        (r: { studentId: string; status: string }) =>
          r.status === "absent" && !alreadyAbsentIds.has(r.studentId)
      )
      .map((r: { studentId: string }) => r.studentId);

    if (newlyAbsentIds.length > 0) {
      // Detached promise: returns response immediately, SMS sends in background.
      notifyAbsentParents(newlyAbsentIds, start, studentClass).catch((err) => {
        console.error("Failed to send absent notifications:", err);
      });
    }

    return NextResponse.json(attendance, { status: 201 });

  } catch (error: unknown) {
    // Duplicate-key (11000): two concurrent upserts raced each other.
    // Recover by doing a plain update on the now-existing document.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      const { start, end } = getUTCDayBounds(date);
      const updated = await Attendance.findOneAndUpdate(
        { class: studentClass, date: { $gte: start, $lt: end } },
        { records, markedBy: (session.user as { id?: string })?.id },
        { new: true }
      );
      return NextResponse.json(updated, { status: 200 });
    }

    const message = error instanceof Error ? error.message : "Failed to save attendance";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// Sends one SMS per newly-absent student to their parent's phone.
async function notifyAbsentParents(
  newlyAbsentIds: string[],
  date: Date,
  studentClass: string
) {
  if (newlyAbsentIds.length === 0) return;

  const academyName = process.env.NEXT_PUBLIC_ACADEMY_NAME || "Bright Future Academy";

  const students = await Student.find(
    { _id: { $in: newlyAbsentIds } },
    { name: 1, class: 1, parentPhone: 1 }
  ).lean();

  for (const student of students) {
    if (!student.parentPhone) {
      console.warn(`Student ${student.name} has no parentPhone - skipping SMS`);
      continue;
    }

    const message = buildAbsentMessage({
      studentName: student.name,
      studentClass: student.class || studentClass,
      date,
      academyName,
    });

    const results = await sendSMS([student.parentPhone], message);
    results.forEach((r) => {
      if (r.success) {
        console.log(`Absent SMS sent: ${student.name} -> ${student.parentPhone}`);
      } else {
        console.error(`Absent SMS failed: ${student.name} -> ${student.parentPhone}: ${r.error}`);
      }
    });
  }
}
