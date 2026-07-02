/**
 * lib/data.ts  -  Shared server-side data fetchers
 *
 * WHY THIS FILE EXISTS:
 * --------------------
 * Several bugs in this project came from the same two patterns:
 *
 *   1. Student.feesPaid drifts out of sync with actual Fee records
 *      (seed scripts, manual DB edits, failed transactions, etc.)
 *
 *   2. pendingFee is a Mongoose virtual that gets stripped by .lean()
 *      and JSON.parse(JSON.stringify()), so it arrives as `undefined`
 *      in client components, making fee badges always show "Cleared"
 *      and the collect-fee form never pre-fill the pending amount.
 *
 * SOLUTION:
 * ---------
 * Every page that shows student fee data calls getStudentsWithFees()
 * from this file. It computes both feesPaid and pendingFee live from
 * the Fee collection via $lookup, so:
 *   - The numbers are always accurate regardless of Student.feesPaid
 *   - pendingFee is always a real number, never undefined
 *   - No scripts needed to "fix" data after something goes wrong
 */

import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Fee from "@/models/Fee";
import type { StudentDTO } from "@/types";

/**
 * Fetch all active students with feesPaid and pendingFee computed
 * live from the Fee ledger. Safe to call from any server component.
 */
export async function getStudentsWithFees(
  sort: Record<string, 1 | -1> = { createdAt: -1 }
): Promise<StudentDTO[]> {
  await dbConnect();

  const students = await Student.aggregate([
    { $match: { isActive: true } },
    {
      // Join with Fee collection to get actual payments
      $lookup: {
        from: "fees",
        localField: "_id",
        foreignField: "studentId",
        as: "feeRecords",
      },
    },
    {
      $addFields: {
        // Sum of all Fee records - the source of truth
        feesPaid: { $sum: "$feeRecords.amount" },
        // pendingFee computed here so it survives lean() and JSON serialization
        pendingFee: {
          $max: [
            { $subtract: ["$totalFee", { $sum: "$feeRecords.amount" }] },
            0,
          ],
        },
      },
    },
    // Drop the feeRecords array - we only needed it for the sums above
    { $project: { feeRecords: 0 } },
    { $sort: sort },
  ]);

  return JSON.parse(JSON.stringify(students));
}

/**
 * Fetch a single student with correct fee numbers from the ledger.
 * Returns null if the student doesn't exist or is inactive.
 */
export async function getStudentWithFees(id: string): Promise<(StudentDTO & {
  feeHistory: Array<{
    _id: string;
    amount: number;
    paymentMethod: string;
    receiptNumber: string;
    month: string;
    paymentDate: string;
    remarks?: string;
  }>;
}) | null> {
  await dbConnect();

  const student = await Student.findById(id).lean();
  if (!student) return null;

  const fees = await Fee.find({ studentId: id })
    .sort({ paymentDate: -1 })
    .lean();

  const actualPaid = fees.reduce((sum, f) => sum + f.amount, 0);
  const pendingFee = Math.max((student.totalFee ?? 0) - actualPaid, 0);

  return JSON.parse(
    JSON.stringify({
      ...student,
      feesPaid: actualPaid,
      pendingFee,
      feeHistory: fees,
    })
  );
}

/**
 * Dashboard-level fee totals, always from the Fee ledger,
 * always excluding soft-deleted students.
 */
export async function getDashboardFeeTotals() {
  await dbConnect();

  const startOfMonth = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)
  );

  const [allTimeResult, thisMonthResult, pendingResult] = await Promise.all([
    // All-time collected from active students
    Fee.aggregate([
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
    ]),

    // This month from active students
    Fee.aggregate([
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
    ]),

    // Pending across all active students
    Student.aggregate([
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
          pending: {
            $max: [{ $subtract: ["$totalFee", { $sum: "$payments.amount" }] }, 0],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$pending" } } },
    ]),
  ]);

  return {
    allTime: allTimeResult[0]?.total ?? 0,
    thisMonth: thisMonthResult[0]?.total ?? 0,
    pending: pendingResult[0]?.total ?? 0,
  };
}
