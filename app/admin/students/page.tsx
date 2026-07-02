import Link from "next/link";
import { Plus, Users, IndianRupee, AlertCircle, GraduationCap } from "lucide-react";
import AdminHeader from "@/components/admin/Header";
import StudentTable from "@/components/admin/students/StudentTable";
import { Button } from "@/components/ui/button";
import { formatCurrency, CLASS_OPTIONS } from "@/lib/utils";
import { getStudentsWithFees } from "@/lib/data";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-navy-700">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default async function StudentsPage() {
  const students = await getStudentsWithFees({ createdAt: -1 });

  const totalFeeCollectable = students.reduce((s, x) => s + x.totalFee, 0);
  const totalPending = students.reduce((s, x) => s + x.pendingFee, 0);
  const totalCollected = students.reduce((s, x) => s + x.feesPaid, 0);
  const pendingCount = students.filter((s) => s.pendingFee > 0).length;

  const classBreakdown = CLASS_OPTIONS.reduce<Record<string, number>>((acc, c) => {
    acc[c] = students.filter((s) => s.class === c).length;
    return acc;
  }, {});
  const topClass = Object.entries(classBreakdown).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-secondary/20">
      <AdminHeader title="Students" subtitle="Manage student records" />

      <div className="p-4 sm:p-6">
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total students"
            value={String(students.length)}
            sub={topClass ? `Most: ${topClass[0]} (${topClass[1]})` : undefined}
            iconClass="bg-navy-100 text-navy-600"
          />
          <StatCard
            icon={GraduationCap}
            label="Fee collected"
            value={formatCurrency(totalCollected)}
            sub={`of ${formatCurrency(totalFeeCollectable)} total`}
            iconClass="bg-success/10 text-success"
          />
          <StatCard
            icon={AlertCircle}
            label="Pending fees"
            value={formatCurrency(totalPending)}
            sub={`${pendingCount} student${pendingCount !== 1 ? "s" : ""} with dues`}
            iconClass="bg-saffron-100 text-saffron-600"
          />
          <StatCard
            icon={IndianRupee}
            label="Fully paid"
            value={String(students.length - pendingCount)}
            sub={`${Math.round(((students.length - pendingCount) / Math.max(students.length, 1)) * 100)}% of students`}
            iconClass="bg-violet-100 text-violet-600"
          />
        </div>

        {/* Table header row */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-navy-700">All students</h2>
            <p className="text-sm text-muted-foreground">Search, filter, sort and manage student records</p>
          </div>
          <Button asChild>
            <Link href="/admin/students/add">
              <Plus className="h-4 w-4" />
              Add student
            </Link>
          </Button>
        </div>

        <div className="mt-4">
          <StudentTable students={students} />
        </div>
      </div>
    </div>
  );
}
