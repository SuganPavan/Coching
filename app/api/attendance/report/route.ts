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
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0, 23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
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

    const present = studentRecords.filter((r) => r.status === "present").length;
    const total = studentRecords.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return NextResponse.json({ records: studentRecords, present, total, percentage });
  }

  return NextResponse.json(records);
}
