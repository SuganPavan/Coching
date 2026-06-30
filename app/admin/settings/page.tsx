import AdminHeader from "@/components/admin/Header";
import AdminManagement from "@/components/admin/settings/AdminManagement";
import ChangePasswordForm from "@/components/admin/settings/ChangePasswordForm";
import SyncFeesButton from "@/components/admin/settings/SyncFeesButton";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";

async function getAdmins() {
  await dbConnect();
  const admins = await Admin.find().select("name email role createdAt").sort({ createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(admins));
}

export default async function SettingsPage() {
  const session = await auth();
  const currentRole = (session?.user as { role?: string })?.role;
  const currentId = (session?.user as { id?: string })?.id;
  const isSuperAdmin = currentRole === "superadmin";

  const admins = isSuperAdmin ? await getAdmins() : [];

  return (
    <div className="min-h-screen bg-secondary/20">
      <AdminHeader title="Settings" subtitle="Manage your account and admin users" />
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-8">

          {/* Admin Management — superadmin only */}
          {isSuperAdmin && (
            <AdminManagement admins={admins} currentId={currentId ?? ""} />
          )}

          {/* Sync Fee Data — fixes Student.feesPaid drift vs Fee ledger */}
          <SyncFeesButton />

          {/* Change Password */}
          <ChangePasswordForm email={session?.user?.email ?? ""} />
        </div>
      </div>
    </div>
  );
}
