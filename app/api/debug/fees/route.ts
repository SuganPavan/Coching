import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Fee from "@/models/Fee";
import { auth } from "@/auth";
import mongoose from "mongoose";

/**
 * GET /api/debug/fees
 * Superadmin only. Returns exact fee numbers from both sources
 * so we can pinpoint exactly what is mismatching on the dashboard.
 *
 * Visit this URL while logged in as superadmin to see the raw data.
 */
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "superadmin") {
    return NextResponse.json({ error: "Superadmin only" }, { status: 403 });
  }

  await dbConnect();

  // 1. What collections actually exist?
  const collections = await mongoose.connection.db!
    .listCollections()
    .toArray();
  const collectionNames = collections.map((c) => c.name);

  // 2. Total Fee records and their sum
  const feeCount = await Fee.countDocuments();
  const feeAgg = await Fee.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);

  // 3. Student totals from Student collection
  const studentAgg = await Student.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalFeeSum: { $sum: "$totalFee" },
        feesPaidSum: { $sum: "$feesPaid" },
        count: { $sum: 1 },
      },
    },
  ]);

  // 4. Per-student breakdown — Fee ledger vs Student.feesPaid
  const studentBreakdown = await Student.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "fees",
        localField: "_id",
        foreignField: "studentId",
        as: "payments",
      },
    },
    {
      $project: {
        name: 1,
        rollNo: 1,
        totalFee: 1,
        feesPaidOnStudent: "$feesPaid",
        feesPaidInLedger: { $sum: "$payments.amount" },
        paymentCount: { $size: "$payments" },
      },
    },
    {
      $project: {
        name: 1,
        rollNo: 1,
        totalFee: 1,
        feesPaidOnStudent: 1,
        feesPaidInLedger: 1,
        paymentCount: 1,
        // Positive = Student.feesPaid is HIGHER than ledger (overstated)
        // Negative = ledger is HIGHER than Student.feesPaid (understated)
        drift: { $subtract: ["$feesPaidOnStudent", "$feesPaidInLedger"] },
      },
    },
    { $sort: { rollNo: 1 } },
  ]);

  // 5. Dashboard pending — using $lookup method
  const pendingFromLookup = await Student.aggregate([
    { $match: { isActive: true } },
    { $lookup: { from: "fees", localField: "_id", foreignField: "studentId", as: "payments" } },
    { $project: { totalFee: 1, actualPaid: { $sum: "$payments.amount" } } },
    { $project: { pending: { $max: [{ $subtract: ["$totalFee", "$actualPaid"] }, 0] } } },
    { $group: { _id: null, total: { $sum: "$pending" } } },
  ]);

  // 6. Dashboard pending — using Student.feesPaid method (old way)
  const pendingFromStudent = await Student.aggregate([
    { $match: { isActive: true } },
    { $project: { pending: { $max: [{ $subtract: ["$totalFee", "$feesPaid"] }, 0] } } },
    { $group: { _id: null, total: { $sum: "$pending" } } },
  ]);

  return NextResponse.json({
    collections: collectionNames,
    feeCollection: {
      count: feeCount,
      sumFromAggregate: feeAgg[0] || null,
    },
    studentCollection: studentAgg[0] || null,
    pendingFees: {
      fromLedgerLookup: pendingFromLookup[0]?.total || 0,
      fromStudentFeesPaid: pendingFromStudent[0]?.total || 0,
      difference: (pendingFromStudent[0]?.total || 0) - (pendingFromLookup[0]?.total || 0),
    },
    perStudentBreakdown: studentBreakdown,
  });
}
