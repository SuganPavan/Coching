import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import mongoose from "mongoose";

/**
 * GET /api/migrate
 *
 * Drops stale indexes left over from previous schema versions.
 * Safe to run multiple times — uses dropIndex which is a no-op
 * if the index doesn't exist (caught and ignored).
 *
 * Run once after deploying this fix:
 *   Visit /api/migrate?secret=YOUR_SEED_SECRET in your browser
 *   OR call it from the admin panel (superadmin only).
 */
export async function GET(req: Request) {
  // Allow either superadmin session OR seed secret for CLI convenience
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  const isAuthorized =
    role === "superadmin" ||
    (process.env.SEED_SECRET && secret === process.env.SEED_SECRET);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const results: Record<string, string> = {};

  // Drop stale `username_1` index from admins collection.
  // This was created by an earlier schema version that had a `username` field
  // with unique: true. Inserting admins without a username now causes
  // E11000 dup key: { username: null } because all new docs share null.
  try {
    await mongoose.connection.collection("admins").dropIndex("username_1");
    results.admins_username_1 = "dropped";
  } catch {
    // Error code 27 = IndexNotFound — index was already dropped or never existed
    results.admins_username_1 = "not found (already clean)";
  }

  return NextResponse.json({
    message: "Migration complete",
    results,
  });
}
