import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import { auth } from "@/auth";

// Only superadmins can manage other admin accounts.
async function requireSuperAdmin() {
  const session = await auth();
  if (!session) return null;
  const role = (session.user as { role?: string })?.role;
  if (role !== "superadmin") return null;
  return session;
}

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden — superadmin access required" }, { status: 403 });
  }

  await dbConnect();
  // Never return passwords — select only safe fields
  const admins = await Admin.find().select("name email role createdAt").sort({ createdAt: -1 }).lean();
  return NextResponse.json(admins);
}

export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden — superadmin access required" }, { status: 403 });
  }

  await dbConnect();
  const { name, email, password, role } = await req.json();

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!["admin", "superadmin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Check duplicate
  const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "admin",
    });

    return NextResponse.json(
      { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create admin";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
