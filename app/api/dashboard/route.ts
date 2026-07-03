import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Faculty from "@/models/Faculty";
import Course from "@/models/Course";
import Attendance from "@/models/Attendance";
import { auth } from "@/auth";
import { getUTCDayBounds } from "@/lib/utils";
import { getDashboardFeeTotals } from "@/lib/data";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const [totalStudents, totalFaculty, totalCourses] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Faculty.countDocuments({ isActive: true }),
    Course.countDocuments({ isActive: true }),
  ]);

  // Attendance today — UTC boundaries, matching how attendance dates are
  // stored (see the attendance save route). Using local server time here
  // would silently miss today's attendance whenever the server isn't
  // running in UTC.
  const { start: todayStart, end: todayEnd } = getUTCDayBounds(new Date());
  const todaysAttendance = await Attendance.find({ date: { $gte: todayStart, $lt: todayEnd } }).lean();
  const presentToday = todaysAttendance.reduce(
    (sum, a) => sum + a.records.filter((r) => r.status === "present" || r.status === "late").length,
    0
  );
  const totalToday = todaysAttendance.reduce((sum, a) => sum + a.records.length, 0);

  // Fee totals — shared helper, always from the Fee ledger, always
  // excluding soft-deleted students, always clamping pending at 0.
  const { allTime: feesCollectedAllTime, thisMonth: feesCollectedThisMonth, pending: pendingFees } =
    await getDashboardFeeTotals();

  return NextResponse.json({
    totalStudents,
    presentToday,
    totalToday,
    feesCollectedAllTime,
    feesCollectedThisMonth,
    pendingFees,
    totalCourses,
    totalFaculty,
  });
}
