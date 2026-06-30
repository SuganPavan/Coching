import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import { auth } from "@/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string })?.role;
  if (role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden — superadmin access required" }, { status: 403 });
  }

  const { id } = await params;
  const currentAdminId = (session.user as { id?: string })?.id;

  // Prevent superadmin from deleting their own account
  if (id === currentAdminId) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  await dbConnect();
  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  return NextResponse.json({ message: "Admin removed successfully" });
}
