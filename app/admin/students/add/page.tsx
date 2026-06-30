import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AdminHeader from "@/components/admin/Header";
import StudentForm from "@/components/admin/students/StudentForm";

export default function AddStudentPage() {
  return (
    <div className="min-h-screen bg-secondary/20">
      <AdminHeader title="Add student" subtitle="Create a new student record" />

      <div className="p-4 sm:p-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/admin/students" className="hover:text-navy-600">Students</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Add student</span>
        </nav>

        <div className="mx-auto max-w-2xl">
          <div className="mb-6 rounded-xl border border-navy-100 bg-navy-50 px-5 py-4">
            <p className="text-sm font-medium text-navy-700">New student registration</p>
            <p className="mt-0.5 text-xs text-navy-600/70">
              Fields marked <span className="text-destructive">*</span> are required.
              Roll number will be auto-assigned if left blank.
            </p>
          </div>
          <StudentForm />
        </div>
      </div>
    </div>
  );
}
