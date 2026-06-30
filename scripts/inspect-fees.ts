/**
 * Diagnostic script: prints every Fee record currently in the database,
 * so we can see exactly what's contributing to the "Fees Collected" total
 * on the admin dashboard.
 *
 * Run with: npx tsx scripts/inspect-fees.ts
 */
import "dotenv/config";
import dbConnect from "../lib/db";
import Fee from "../models/Fee";
import "../models/Student"; // must be imported so populate("studentId") can resolve it

async function main() {
  await dbConnect();

  const allFees = await Fee.find({})
    .populate("studentId", "name rollNo")
    .sort({ paymentDate: -1 })
    .lean();

  console.log(`\nTotal Fee records in database: ${allFees.length}\n`);

  if (allFees.length === 0) {
    console.log("No Fee records found at all.\n");
    process.exit(0);
  }

  let grandTotal = 0;
  for (const f of allFees) {
    const student = f.studentId as unknown as { name?: string; rollNo?: string } | null;
    const studentLabel = student?.name
      ? `${student.name} (${student.rollNo || "no roll no"})`
      : "UNKNOWN / DELETED STUDENT";

    console.log(
      `  Rs. ${f.amount}` .padEnd(12) +
      `| ${f.receiptNumber}`.padEnd(22) +
      `| ${f.paymentMethod}`.padEnd(14) +
      `| ${new Date(f.paymentDate).toLocaleDateString("en-IN")}`.padEnd(14) +
      `| ${studentLabel}`
    );
    grandTotal += f.amount;
  }

  console.log(`\nSum of ALL Fee records (all-time): Rs. ${grandTotal.toLocaleString("en-IN")}`);

  // Also show this month's total specifically, since that's what the dashboard highlights
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthFees = allFees.filter((f) => new Date(f.paymentDate) >= startOfMonth);
  const thisMonthTotal = thisMonthFees.reduce((sum, f) => sum + f.amount, 0);

  console.log(`Sum of Fee records THIS MONTH (what dashboard shows): Rs. ${thisMonthTotal.toLocaleString("en-IN")}`);
  console.log(`(${thisMonthFees.length} record(s) dated this month)\n`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Inspection script failed:", err);
  process.exit(1);
});
