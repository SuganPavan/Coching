import AdminHeader from "@/components/admin/Header";
import AttendanceManager from "@/components/admin/attendance/AttendanceManager";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import type { StudentDTO } from "@/types";

async function getStudents(): Promise<StudentDTO[]> {
  await dbConnect();
  const students = await Student.find({ isActive: true }).sort({ rollNo: 1 }).lean();
  return JSON.parse(JSON.stringify(students));
}

export default async function AttendancePage() {
  const students = await getStudents();

  return (
    <div>
      <AdminHeader title="Student attendance" subtitle="Mark attendance for students" />
      <div className="p-4 sm:p-6">
        <AttendanceManager allStudents={students} />
      </div>
    </div>
  );
}
