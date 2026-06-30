/**
 * One-time cleanup: remove leftover SEED/DEMO Fee records from the database.
 *
 * Context: scripts/seed.ts and app/api/seed/route.ts both create demo Fee
 * documents for every student (dated "today" on purpose, so the dashboard
 * always shows non-zero numbers in development). If that seed ever ran
 * against your real/production database, those fake records are still
 * sitting there and get summed into "Fees Collected" on the admin
 * dashboard alongside your real, manually-collected payments - inflating
 * the total.
 *
 * How seed records are identified:
 *   Real payments (created via the admin "Collect Fee" form, app/api/fees)
 *   get a receiptNumber like:        BFA-2026-123456
 *   Seed/demo payments get a receiptNumber like:  BFA-2026-123456-A001
 *   (the seed script appends "-{rollNo}" to the receipt number - see
 *   scripts/seed.ts line ~140). This script uses that suffix as the marker.
 *
 * Run with:        npx tsx scripts/cleanup-seed-fees.ts --dry-run   (preview only)
 *                   npx tsx scripts/cleanup-seed-fees.ts             (apply deletion)
 *
 * Safe to run multiple times - does nothing if no seed records remain.
 */
import "dotenv/config";
import dbConnect from "../lib/db";
import Fee from "../models/Fee";
import Student from "../models/Student";
import { Types } from "mongoose";

// Matches receipt numbers like "BFA-2026-123456-A001" (real format + a
// trailing "-" followed by a roll-number-like token). Real receipts from
// app/api/fees never have this trailing segment.
const SEED_RECEIPT_PATTERN = /^BFA-\d{4}-\d{6}-\S+$/;

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  await dbConnect();

  console.log(`\nScanning for seed/demo Fee records${dryRun ? " (dry run, no changes will be made)" : ""}...\n`);

  const allFees = await Fee.find({}, { receiptNumber: 1, studentId: 1, amount: 1, paymentDate: 1 }).lean();

  const seedFees = allFees.filter((f) => SEED_RECEIPT_PATTERN.test(f.receiptNumber));

  if (seedFees.length === 0) {
    console.log("No seed/demo Fee records found. Nothing to clean up.\n");
    process.exit(0);
  }

  console.log(`Found ${seedFees.length} seed/demo Fee record(s) out of ${allFees.length} total:\n`);

  const affectedStudentIds = new Set<string>();
  let totalSeedAmount = 0;

  for (const f of seedFees) {
    console.log(`  ${f.receiptNumber}  Rs. ${f.amount}  (dated ${new Date(f.paymentDate).toLocaleDateString("en-IN")})`);
    totalSeedAmount += f.amount;
    affectedStudentIds.add(f.studentId.toString());
  }

  console.log(`\nTotal seed amount that was inflating "Fees Collected": Rs. ${totalSeedAmount.toLocaleString("en-IN")}`);
  console.log(`Affected students: ${affectedStudentIds.size}\n`);

  if (dryRun) {
    console.log("Dry run complete. Re-run without --dry-run to apply these changes.\n");
    process.exit(0);
  }

  const idsToDelete = seedFees.map((f) => f._id);
  const deleteResult = await Fee.deleteMany({ _id: { $in: idsToDelete } });
  console.log(`Deleted ${deleteResult.deletedCount} seed/demo Fee record(s).\n`);

  console.log("Recomputing feesPaid for affected students from the now-clean ledger...\n");
  for (const studentId of affectedStudentIds) {
    const ledgerAgg = await Fee.aggregate([
      { $match: { studentId: new Types.ObjectId(studentId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const correctTotal = ledgerAgg[0]?.total || 0;
    await Student.findByIdAndUpdate(studentId, { feesPaid: correctTotal });
    console.log(`  Student ${studentId}: feesPaid corrected to Rs. ${correctTotal.toLocaleString("en-IN")}`);
  }

  console.log("\nCleanup complete. The dashboard should now reflect only real payments.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Cleanup script failed:", err);
  process.exit(1);
});
