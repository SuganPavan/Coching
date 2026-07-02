/**
 * Diagnoses exactly what the dashboard is reading from MongoDB.
 * Run: npx tsx scripts/diagnose-dashboard.ts
 */
import "dotenv/config";
import dbConnect from "../lib/db";
import Student from "../models/Student";
import Fee from "../models/Fee";
import Attendance from "../models/Attendance";

function getUTCDayBounds(date: Date) {
  const dateStr = date.toISOString().slice(0, 10);
  const start = new Date(dateStr + "T00:00:00.000Z");
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

async function main() {
  await dbConnect();

  console.log("\n========================================");
  console.log("DASHBOARD DIAGNOSTIC");
  console.log("Current UTC time:", new Date().toISOString());
  console.log("Current IST time:", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  console.log("========================================\n");

  // --- Students ---
  const totalActive = await Student.countDocuments({ isActive: true });
  const totalInactive = await Student.countDocuments({ isActive: false });
  console.log("STUDENTS");
  console.log("  Active:", totalActive);
  console.log("  Inactive (soft-deleted):", totalInactive);

  // --- Attendance ---
  const { start: todayStart, end: todayEnd } = getUTCDayBounds(new Date());
  console.log("\nATTENDANCE TODAY");
  console.log("  Query window:", todayStart.toISOString(), "to", todayEnd.toISOString());

  const todayDocs = await Attendance.find({ date: { $gte: todayStart, $lt: todayEnd } }).lean();
  console.log("  Attendance documents found for today:", todayDocs.length);

  if (todayDocs.length === 0) {
    console.log("  (No attendance marked for today yet)");
  } else {
    for (const doc of todayDocs) {
      const present = doc.records.filter((r) => r.status === "present").length;
      const absent = doc.records.filter((r) => r.status === "absent").length;
      const late = doc.records.filter((r) => r.status === "late").length;
      console.log(`  Class: ${doc.class} | Date stored: ${doc.date.toISOString()}`);
      console.log(`    Present: ${present} | Absent: ${absent} | Late: ${late} | Total: ${doc.records.length}`);
    }
  }

  // Show all attendance docs with their stored dates so we can see timezone drift
  const allAttendance = await Attendance.find({}).sort({ date: -1 }).limit(5).lean();
  console.log("\n  Last 5 attendance records (any date):");
  for (const doc of allAttendance) {
    console.log(`    Class: ${doc.class} | Stored date (UTC): ${doc.date.toISOString()} | IST: ${doc.date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
  }

  // --- Fees ---
  console.log("\nFEES");

  const allFees = await Fee.find({}).lean();
  console.log("  Total Fee records:", allFees.length);

  if (allFees.length === 0) {
    console.log("  (No fee records at all in database)");
  } else {
    for (const f of allFees) {
      console.log(`  Rs. ${f.amount} | receipt: ${f.receiptNumber} | method: ${f.paymentMethod} | date: ${f.paymentDate?.toISOString?.() || f.paymentDate}`);
    }
  }

  // Check if studentId in Fee actually matches an active student
  console.log("\n  Fee-to-student linkage:");
  for (const f of allFees) {
    const student = await Student.findById(f.studentId, { name: 1, isActive: 1 }).lean();
    if (!student) {
      console.log(`  Rs. ${f.amount} -> studentId ${f.studentId} = NOT FOUND (orphaned record)`);
    } else {
      console.log(`  Rs. ${f.amount} -> ${student.name} (isActive: ${student.isActive})`);
    }
  }

  // Simulate the exact dashboard aggregation
  const allTimeAgg = await Fee.aggregate([
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
  console.log("\n  Dashboard aggregation result (active students only):", allTimeAgg[0]?.total ?? 0);

  const startOfMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const thisMonthAgg = await Fee.aggregate([
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
  console.log("  This month's total:", thisMonthAgg[0]?.total ?? 0);
  console.log("  This month query from:", startOfMonth.toISOString());

  // Check paymentDate stored on each fee record
  console.log("\n  Fee paymentDate values stored in DB:");
  for (const f of allFees) {
    console.log(`    Rs. ${f.amount} | paymentDate: ${f.paymentDate} | type: ${typeof f.paymentDate}`);
  }

  console.log("\n========================================\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Diagnostic failed:", err);
  process.exit(1);
});
