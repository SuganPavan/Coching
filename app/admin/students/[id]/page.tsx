import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import AdminHeader from "@/components/admin/Header";
import StudentForm from "@/components/admin/students/StudentForm";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getStudentWithFees } from "@/lib/data";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getStudentWithFees(id);
  if (!student) notFound();

  return (
    <div className="min-h-screen bg-secondary/20">
      <AdminHeader title={`Edit — ${student.name}`} subtitle={`Roll No. ${student.rollNo} · ${student.class}`} />

      <div className="p-4 sm:p-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/admin/students" className="hover:text-navy-600">Students</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{student.name}</span>
        </nav>

        <div className="mx-auto max-w-2xl">
          {/* Student summary card */}
          <div className="mb-6 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-100 text-sm font-bold text-navy-700">
                  {student.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-navy-700">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Roll #{student.rollNo} · {student.class}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={student.pendingFee > 0 ? "warning" : "success"}>
                  {student.pendingFee > 0 ? `${formatCurrency(student.pendingFee)} due` : "Fully paid"}
                </Badge>
                <Badge variant="secondary">
                  Joined {formatDate(student.joiningDate)}
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total fee</p>
                <p className="mt-0.5 text-sm font-semibold">{formatCurrency(student.totalFee)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="mt-0.5 text-sm font-semibold text-success">{formatCurrency(student.feesPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="mt-0.5 text-sm font-semibold text-saffron-600">{formatCurrency(student.pendingFee)}</p>
              </div>
            </div>
          </div>

          <StudentForm student={student} />
        </div>
      </div>
    </div>
  );
}
