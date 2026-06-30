import AdminHeader from "@/components/admin/Header";
import AttendanceReport from "@/components/admin/attendance/AttendanceReport";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import type { StudentDTO } from "@/types";

async function getStudents(): Promise<StudentDTO[]> {
  await dbConnect();
  const students = await Student.find({ isActive: true }).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(students));
}

export default async function AttendanceReportPage() {
  const students = await getStudents();

  return (
    <div>
      <AdminHeader title="Attendance report" subtitle="Monthly attendance summary per student" />
      <div className="p-4 sm:p-6">
        <AttendanceReport students={students} />
      </div>
    </div>
  );
}
