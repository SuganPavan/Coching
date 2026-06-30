import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  await dbConnect();
  const admin = await Admin.findOne({ email: session.user.email });
  if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  const isValid = await bcrypt.compare(currentPassword, admin.password);
  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  return NextResponse.json({ message: "Password updated successfully" });
}
