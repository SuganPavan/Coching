import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Faculty from "@/models/Faculty";
import Course from "@/models/Course";
import Attendance from "@/models/Attendance";
import Fee from "@/models/Fee";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const [totalStudents, totalFaculty, totalCourses] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Faculty.countDocuments({ isActive: true }),
    Course.countDocuments({ isActive: true }),
  ]);

  // Attendance today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysAttendance = await Attendance.find({ date: { $gte: today, $lt: tomorrow } }).lean();
  const presentToday = todaysAttendance.reduce(
    (sum, a) => sum + a.records.filter((r) => r.status === "present").length,
    0
  );
  const totalToday = todaysAttendance.reduce((sum, a) => sum + a.records.length, 0);

  // Fees collected this month - only from active students.
  // Student deletion is a soft delete (isActive: false) that preserves
  // historical Fee records for accounting, so we must exclude those from
  // the live "Fees Collected" total or a deleted student's old payment
  // keeps inflating the number forever.
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const feesAgg = await Fee.aggregate([
    { $match: { paymentDate: { $gte: startOfMonth } } },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    { $match: { "student.isActive": true } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const feesCollectedThisMonth = feesAgg[0]?.total || 0;

  // Pending fees across all active students
  const pendingAgg = await Student.aggregate([
    { $match: { isActive: true } },
    { $project: { pending: { $subtract: ["$totalFee", "$feesPaid"] } } },
    { $group: { _id: null, total: { $sum: "$pending" } } },
  ]);
  const pendingFees = pendingAgg[0]?.total || 0;

  return NextResponse.json({
    totalStudents,
    presentToday,
    totalToday,
    feesCollectedThisMonth,
    pendingFees,
    totalCourses,
    totalFaculty,
  });
}
