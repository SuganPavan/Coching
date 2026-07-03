import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import { auth } from "@/auth";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const month = searchParams.get("month"); // format: "2026-06"
  const studentClass = searchParams.get("class");

  const query: Record<string, unknown> = {};

  if (month) {
    const [year, mon] = month.split("-").map(Number);
    // Use UTC boundaries to match how attendance dates are stored
    // (see getUTCDayBounds in lib/utils.ts and the attendance save route).
    // Using the server's local timezone here (as before) can silently miss
    // or misattribute records saved right at a month boundary whenever the
    // server isn't running in UTC.
    const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, mon, 1, 0, 0, 0, 0));
    query.date = { $gte: start, $lt: end };
  }
  if (studentClass) query.class = studentClass;

  const records = await Attendance.find(query).sort({ date: 1 }).lean();

  if (studentId) {
    // Filter to just this student's status per day
    const studentObjectId = new Types.ObjectId(studentId);
    const studentRecords = records.map((r) => {
      const entry = r.records.find((rec) => rec.studentId.toString() === studentObjectId.toString());
      return {
        date: r.date,
        class: r.class,
        status: entry?.status || "not_marked",
        remarks: entry?.remarks || "",
      };
    });

    // "late" counts toward presence, matching the dashboard's presentToday
    // calculation (app/admin/dashboard/page.tsx) — otherwise a student
    // marked "late" would count as present on the dashboard but as
    // absent-equivalent here, giving two different attendance pictures
    // for the same day.
    const present = studentRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const total = studentRecords.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return NextResponse.json({ records: studentRecords, present, total, percentage });
  }

  return NextResponse.json(records);
}
