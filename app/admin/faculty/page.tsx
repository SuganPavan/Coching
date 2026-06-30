import AdminHeader from "@/components/admin/Header";
import FacultyManager from "@/components/admin/faculty/FacultyManager";
import dbConnect from "@/lib/db";
import Faculty from "@/models/Faculty";
import type { FacultyDTO } from "@/types";

async function getFaculty(): Promise<FacultyDTO[]> {
  await dbConnect();
  const faculty = await Faculty.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(faculty));
}

export default async function AdminFacultyPage() {
  const faculty = await getFaculty();

  return (
    <div>
      <AdminHeader title="Faculty" subtitle="Manage teaching staff" />
      <div className="p-4 sm:p-6">
        <FacultyManager faculty={faculty} />
      </div>
    </div>
  );
}
