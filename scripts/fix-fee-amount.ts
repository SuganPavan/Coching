/**
 * One-off fix: correct a specific Fee record's amount, identified by its
 * receipt number, then recompute that student's feesPaid total.
 *
 * Usage:
 *   npx tsx scripts/fix-fee-amount.ts <receiptNumber> <correctAmount>
 *
 * Example:
 *   npx tsx scripts/fix-fee-amount.ts BFA-2026-080838 2300
 */
import "dotenv/config";
import dbConnect from "../lib/db";
import Fee from "../models/Fee";
import Student from "../models/Student";

async function main() {
  const [receiptNumber, correctAmountStr] = process.argv.slice(2);

  if (!receiptNumber || !correctAmountStr) {
    console.error("\nUsage: npx tsx scripts/fix-fee-amount.ts <receiptNumber> <correctAmount>");
    console.error("Example: npx tsx scripts/fix-fee-amount.ts BFA-2026-080838 2300\n");
    process.exit(1);
  }

  const correctAmount = Number(correctAmountStr);
  if (!correctAmount || correctAmount <= 0) {
    console.error("\ncorrectAmount must be a positive number.\n");
    process.exit(1);
  }

  await dbConnect();

  const fee = await Fee.findOne({ receiptNumber }).populate("studentId", "name rollNo");
  if (!fee) {
    console.error(`\nNo Fee record found with receiptNumber "${receiptNumber}".\n`);
    process.exit(1);
  }

  const student = fee.studentId as unknown as { name?: string; rollNo?: string; _id?: string };

  console.log(`\nFound record: ${receiptNumber}`);
  console.log(`  Student:        ${student?.name || "unknown"} (${student?.rollNo || "no roll no"})`);
  console.log(`  Current amount: Rs. ${fee.amount}`);
  console.log(`  New amount:     Rs. ${correctAmount}\n`);

  fee.amount = correctAmount;
  await fee.save();

  // Recompute this student's feesPaid from the ledger, same pattern as the live routes
  const studentId = (fee.studentId as unknown as { _id: string })._id || fee.studentId;
  const ledgerAgg = await Fee.aggregate([
    { $match: { studentId: typeof studentId === "string" ? fee.studentId : studentId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const correctTotal = ledgerAgg[0]?.total || 0;
  await Student.findByIdAndUpdate(studentId, { feesPaid: correctTotal });

  console.log(`Updated. Student's feesPaid is now Rs. ${correctTotal.toLocaleString("en-IN")}.\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fix script failed:", err);
  process.exit(1);
});
