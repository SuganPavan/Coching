import Link from "next/link";
import { Users, ClipboardCheck, IndianRupee, AlertCircle, UserPlus, CalendarCheck, Wallet, Megaphone, ArrowRight } from "lucide-react";
import AdminHeader from "@/components/admin/Header";
import DashboardStatCard from "@/components/admin/DashboardStats";
import { formatCurrency, formatDate } from "@/lib/utils";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Faculty from "@/models/Faculty";
import Attendance from "@/models/Attendance";
import Fee from "@/models/Fee";
import Enquiry from "@/models/Enquiry";

async function getDashboardData() {
  await dbConnect();

  const [totalStudents] = await Promise.all([Student.countDocuments({ isActive: true })]);
  await Faculty.countDocuments({ isActive: true }); // ensure model is registered

  // --- Attendance today ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysAttendance = await Attendance.find({ date: { $gte: today, $lt: tomorrow } }).lean();
  const presentToday = todaysAttendance.reduce(
    (sum, a) => sum + a.records.filter((r) => r.status === "present").length,
    0
  );

  // --- Fee calculations - always read from the Fee ledger (source of truth) ---
  //
  // IMPORTANT: We do NOT use Student.feesPaid for dashboard totals.
  // Student.feesPaid is a denormalised cache that can drift out of sync with
  // the actual Fee documents (e.g. seeded data uses a hardcoded past date).
  // The Fee collection is the authoritative ledger of real transactions.
  //
  // IMPORTANT: We also exclude fees belonging to deactivated students.
  // Student deletion is a soft delete (isActive: false) that intentionally
  // preserves their Fee history for accounting purposes (see app/api/students/[id]/route.ts).
  // But "Fees Collected" on the dashboard should reflect money tied to
  // currently active students, so a deleted test/duplicate student's old
  // payment doesn't keep inflating the total forever.

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // All-time total collected from active students only
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
  const feesCollectedAllTime = allTimeAgg[0]?.total || 0;

  // This month's collections from active students only
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
  const feesCollectedThisMonth = thisMonthAgg[0]?.total || 0;

  // Pending fees = sum of totalFee across active students MINUS all fees
  // ever collected in the Fee ledger for those students.
  // $max with 0 prevents negative values when feesPaid > totalFee.
  const pendingAgg = await Student.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "fees",
        localField: "_id",
        foreignField: "studentId",
        as: "payments",
      },
    },
    {
      $project: {
        totalFee: 1,
        actualPaid: { $sum: "$payments.amount" },
      },
    },
    {
      $project: {
        pending: {
          $max: [{ $subtract: ["$totalFee", "$actualPaid"] }, 0],
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$pending" } } },
  ]);
  const pendingFees = pendingAgg[0]?.total || 0;

  // --- Recent data ---
  const recentStudents = await Student.find({ isActive: true }).sort({ createdAt: -1 }).limit(4).lean();
  const recentEnquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(3).lean();

  return {
    totalStudents,
    presentToday,
    feesCollectedThisMonth,
    feesCollectedAllTime,
    pendingFees,
    recentStudents,
    recentEnquiries,
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const adminName = session?.user?.name || "Admin";
  const data = await getDashboardData();

  return (
    <div>
      <AdminHeader title={`Welcome, ${adminName}!`} subtitle="Manage your academy easily." adminName={adminName} />

      <div className="p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            icon={Users}
            iconClassName="bg-navy-50 text-navy-600"
            label="Total students"
            value={String(data.totalStudents)}
            href="/admin/students"
            linkLabel="View all students"
          />
          <DashboardStatCard
            icon={ClipboardCheck}
            iconClassName="bg-success/10 text-success"
            label="Present today"
            value={String(data.presentToday)}
            href="/admin/attendance"
            linkLabel="Mark attendance"
          />
          <DashboardStatCard
            icon={IndianRupee}
            iconClassName="bg-violet-100 text-violet-600"
            label="Fees collected (all time)"
            value={formatCurrency(data.feesCollectedAllTime)}
            href="/admin/fees"
            linkLabel={`This month: ${formatCurrency(data.feesCollectedThisMonth)}`}
          />
          <DashboardStatCard
            icon={AlertCircle}
            iconClassName="bg-saffron-100 text-saffron-600"
            label="Pending fees"
            value={formatCurrency(data.pendingFees)}
            href="/admin/fees"
            linkLabel="View pending"
            linkClassName="text-saffron-600"
          />
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold text-navy-700">Quick actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/students/add" className="flex flex-col items-center gap-2 rounded-md bg-navy-50 py-5 text-sm font-medium text-navy-700 hover:bg-navy-100">
              <UserPlus className="h-5 w-5" /> Add student
            </Link>
            <Link href="/admin/attendance" className="flex flex-col items-center gap-2 rounded-md bg-success/10 py-5 text-sm font-medium text-success hover:bg-success/15">
              <CalendarCheck className="h-5 w-5" /> Mark attendance
            </Link>
            <Link href="/admin/fees/collect" className="flex flex-col items-center gap-2 rounded-md bg-violet-50 py-5 text-sm font-medium text-violet-700 hover:bg-violet-100">
              <Wallet className="h-5 w-5" /> Collect fee
            </Link>
            <Link href="/admin/enquiries" className="flex flex-col items-center gap-2 rounded-md bg-saffron-50 py-5 text-sm font-medium text-saffron-700 hover:bg-saffron-100">
              <Megaphone className="h-5 w-5" /> View enquiries
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-navy-700">Recent students</h2>
            </div>
            {data.recentStudents.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No students added yet.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Class</th>
                      <th className="pb-2 font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentStudents.map((s) => (
                      <tr key={s._id.toString()} className="border-t border-border">
                        <td className="py-2.5">{s.name}</td>
                        <td className="py-2.5 text-muted-foreground">{s.class}</td>
                        <td className="py-2.5 text-muted-foreground">{s.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link href="/admin/students" className="mt-4 flex items-center gap-1 text-sm font-medium text-navy-600 hover:underline">
              View all students <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold text-navy-700">Recent enquiries</h2>
            {data.recentEnquiries.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No enquiries yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {data.recentEnquiries.map((e) => (
                  <li key={e._id.toString()} className="flex items-start gap-3 rounded-md border border-border p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-600">
                      <Megaphone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{e.name} &middot; {e.class}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(e.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/enquiries" className="mt-4 flex items-center gap-1 text-sm font-medium text-navy-600 hover:underline">
              View all enquiries <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
