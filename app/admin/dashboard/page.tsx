import Link from "next/link";
import {
  Users, ClipboardCheck, IndianRupee, AlertCircle,
  UserPlus, CalendarCheck, Wallet, Megaphone, ArrowRight,
} from "lucide-react";
import AdminHeader from "@/components/admin/Header";
import DashboardStatCard from "@/components/admin/DashboardStats";
import { formatCurrency, formatDate, getUTCDayBounds } from "@/lib/utils";
import { getDashboardFeeTotals } from "@/lib/data";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Faculty from "@/models/Faculty";
import Attendance from "@/models/Attendance";
import Enquiry from "@/models/Enquiry";

async function getDashboardData() {
  await dbConnect();

  // Register Faculty model so populate() works elsewhere
  await Faculty.countDocuments({ isActive: true });

  // Total active students
  const totalStudents = await Student.countDocuments({ isActive: true });

  // --- Present today ---
  // Logic:
  //   - Find all attendance docs saved for today
  //   - Count students explicitly marked "present" or "late"
  //   - Students not in any attendance doc are NOT counted
  //     (attendance must be actively saved to reflect on dashboard)
  const { start: todayStart, end: todayEnd } = getUTCDayBounds(new Date());

  const todayDocs = await Attendance.find({
    date: { $gte: todayStart, $lt: todayEnd },
  }).lean();

  const presentToday = todayDocs.reduce((sum, doc) => {
    return (
      sum +
      doc.records.filter(
        (r) => r.status === "present" || r.status === "late"
      ).length
    );
  }, 0);

  // --- Fee totals from shared helper (always from Fee ledger, never Student.feesPaid) ---
  const { allTime: feesCollectedAllTime, thisMonth: feesCollectedThisMonth, pending: pendingFees } =
    await getDashboardFeeTotals();

  // --- Recent data ---
  const [recentStudents, recentEnquiries] = await Promise.all([
    Student.find({ isActive: true }).sort({ createdAt: -1 }).limit(4).lean(),
    Enquiry.find().sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  return {
    totalStudents,
    presentToday,
    feesCollectedThisMonth,
    feesCollectedAllTime,
    pendingFees,
    recentStudents: JSON.parse(JSON.stringify(recentStudents)),
    recentEnquiries: JSON.parse(JSON.stringify(recentEnquiries)),
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const adminName = session?.user?.name || "Admin";
  const data = await getDashboardData();

  return (
    <div>
      <AdminHeader
        title={"Welcome, " + adminName + "!"}
        subtitle="Manage your academy easily."
        adminName={adminName}
      />

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
            linkLabel={"This month: " + formatCurrency(data.feesCollectedThisMonth)}
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
            <Link
              href="/admin/students/add"
              className="flex flex-col items-center gap-2 rounded-md bg-navy-50 py-5 text-sm font-medium text-navy-700 hover:bg-navy-100"
            >
              <UserPlus className="h-5 w-5" /> Add student
            </Link>
            <Link
              href="/admin/attendance"
              className="flex flex-col items-center gap-2 rounded-md bg-success/10 py-5 text-sm font-medium text-success hover:bg-success/15"
            >
              <CalendarCheck className="h-5 w-5" /> Mark attendance
            </Link>
            <Link
              href="/admin/fees/collect"
              className="flex flex-col items-center gap-2 rounded-md bg-violet-50 py-5 text-sm font-medium text-violet-700 hover:bg-violet-100"
            >
              <Wallet className="h-5 w-5" /> Collect fee
            </Link>
            <Link
              href="/admin/enquiries"
              className="flex flex-col items-center gap-2 rounded-md bg-saffron-50 py-5 text-sm font-medium text-saffron-700 hover:bg-saffron-100"
            >
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
                    {data.recentStudents.map((s: any) => (
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
            <Link
              href="/admin/students"
              className="mt-4 flex items-center gap-1 text-sm font-medium text-navy-600 hover:underline"
            >
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
                  <li
                    key={e._id.toString()}
                    className="flex items-start gap-3 rounded-md border border-border p-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-600">
                      <Megaphone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {e.name} &middot; {e.class}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(e.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/enquiries"
              className="mt-4 flex items-center gap-1 text-sm font-medium text-navy-600 hover:underline"
            >
              View all enquiries <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
