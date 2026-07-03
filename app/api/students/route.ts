import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Fee from "@/models/Fee";
import { auth } from "@/auth";
import { generateReceiptNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const studentClass = searchParams.get("class") || "";
  const activeOnly = searchParams.get("activeOnly") !== "false";

  const query: Record<string, unknown> = {};
  if (activeOnly) query.isActive = true;
  if (studentClass) query.class = studentClass;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { rollNo: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const students = await Student.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await req.json();

  // If an initial "fees paid so far" amount was entered at enrollment,
  // it must land in the Fee ledger too — not just on the Student document.
  // Every fee figure elsewhere in the app (Fees Collected, Pending Fees,
  // the student's own badge) is computed from the ledger, never from
  // Student.feesPaid directly, so a payment recorded only on the student
  // doc is invisible everywhere else: Fees Collected shows ₹0 for it and
  // Pending shows the full totalFee, even though feesPaid says otherwise.
  const openingBalance = Number(body.feesPaid) || 0;

  try {
    // Auto-generate roll number if not supplied.
    //
    // Rules:
    //   1. Query ALL students (not just the same class) so we never reuse a
    //      number that exists in a different class.
    //   2. Convert rollNo to a number for the sort — string sort puts "99"
    //      after "201" which would pick 100 as "next" even though 301 exists.
    //   3. Retry once if a concurrent insert wins the race and causes a
    //      duplicate key error (E11000), re-querying for the true maximum.
    if (!body.rollNo) {
      body.rollNo = await generateRollNo();
    }

    const student = await Student.create(body);
    if (openingBalance > 0) {
      await createOpeningBalanceFee(student._id, openingBalance, session);
    }
    return NextResponse.json(student, { status: 201 });
  } catch (error: unknown) {
    // Duplicate rollNo from a race condition — retry with a fresh max query
    if (isDuplicateKeyError(error, "rollNo")) {
      try {
        body.rollNo = await generateRollNo();
        const student = await Student.create(body);
        if (openingBalance > 0) {
          await createOpeningBalanceFee(student._id, openingBalance, session);
        }
        return NextResponse.json(student, { status: 201 });
      } catch (retryError: unknown) {
        if (isDuplicateKeyError(retryError, "rollNo")) {
          return NextResponse.json(
            { error: "Could not assign a unique roll number. Please try again." },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: retryError instanceof Error ? retryError.message : "Failed to create student" },
          { status: 400 }
        );
      }
    }

    // Surface other validation errors cleanly — but never leak the raw
    // MongoDB E11000 string to the UI for fields other than rollNo.
    const message =
      error instanceof Error
        ? error.message.includes("E11000")
          ? "A student with this roll number already exists."
          : error.message
        : "Failed to create student";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * Records a student's initial "fees paid so far" amount (entered at
 * enrollment) as a real Fee ledger entry, so it's counted everywhere the
 * ledger is the source of truth (dashboard, fees list, student badges).
 * Failures here are logged but not thrown — we don't want to fail student
 * creation over this; worst case the admin re-records it via Collect Fee
 * and/or runs Sync Fee Data from Settings.
 */
async function createOpeningBalanceFee(
  studentId: unknown,
  amount: number,
  session: { user?: { id?: string } }
) {
  try {
    await Fee.create({
      studentId,
      amount,
      paymentMethod: "cash",
      month: "Opening balance",
      remarks: "Fees paid prior to enrollment in this system",
      receiptNumber: generateReceiptNumber(),
      collectedBy: session.user?.id,
    });
  } catch (error) {
    console.error("[Students] Failed to create opening balance Fee record:", error);
  }
}

/**
 * Returns the next available roll number by finding the highest numeric
 * rollNo across ALL students (regardless of class) and adding 1.
 * Falls back to 101 if no students exist yet.
 */
async function generateRollNo(): Promise<string> {
  // Aggregate to find the max numeric value — avoids string-sort pitfalls
  const result = await Student.aggregate([
    {
      $addFields: {
        rollNoInt: { $toInt: "$rollNo" },
      },
    },
    {
      $group: {
        _id: null,
        maxRollNo: { $max: "$rollNoInt" },
      },
    },
  ]);

  const max = result[0]?.maxRollNo;
  // If no students or all rollNos are non-numeric, start at 101
  const next = max && !isNaN(max) ? max + 1 : 101;
  return String(next);
}

/** Type-guard for MongoDB duplicate key errors (code 11000 / 11001). */
function isDuplicateKeyError(error: unknown, field?: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { code?: number; keyPattern?: Record<string, unknown> };
  if (err.code !== 11000 && err.code !== 11001) return false;
  if (field && err.keyPattern) return field in err.keyPattern;
  return true;
}
