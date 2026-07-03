import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student, { IStudent } from "@/models/Student";
import Fee from "@/models/Fee";
import { auth } from "@/auth";
import type { AnyBulkWriteOperation } from "mongoose";

/**
 * POST /api/admin/sync-fees
 *
 * Recomputes every active student's feesPaid field from the actual
 * Fee ledger records. Run this once to fix any existing drift between
 * Student.feesPaid and the sum of Fee records.
 *
 * Also accessible from Settings → "Sync Fee Data" button.
 * Superadmin only.
 */
export async function POST() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (!session || !["admin", "superadmin"].includes(role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // Aggregate the total paid per student from the Fee ledger
  const ledgerTotals = await Fee.aggregate([
    { $group: { _id: "$studentId", totalPaid: { $sum: "$amount" } } },
  ]);

  // Build a map: studentId string → totalPaid
  const ledgerMap = new Map<string, number>(
    ledgerTotals.map((r) => [r._id.toString(), r.totalPaid])
  );

  // Get all active students
  const students = await Student.find({ isActive: true }).select("_id feesPaid").lean();

  let updated = 0;
  let alreadyCorrect = 0;

  const bulkOps = students
    .map((s) => {
      const correctPaid = ledgerMap.get(s._id.toString()) ?? 0;
      if (s.feesPaid === correctPaid) {
        alreadyCorrect++;
        return null;
      }
      updated++;
      return {
        updateOne: {
          filter: { _id: s._id },
          update: { $set: { feesPaid: correctPaid } },
        },
      };
    })
    .filter(Boolean) as AnyBulkWriteOperation<IStudent>[];

  if (bulkOps.length > 0) {
    await Student.bulkWrite(bulkOps);
  }

  return NextResponse.json({
    message: "Fee sync complete",
    studentsChecked: students.length,
    updated,
    alreadyCorrect,
  });
}
