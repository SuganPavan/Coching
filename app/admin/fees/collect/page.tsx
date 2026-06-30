import AdminHeader from "@/components/admin/Header";
import CollectFeeForm from "@/components/admin/fees/CollectFeeForm";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import type { StudentDTO } from "@/types";

async function getStudents(): Promise<StudentDTO[]> {
  await dbConnect();
  const students = await Student.find({ isActive: true }).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(students));
}

export default async function CollectFeePage() {
  const students = await getStudents();

  return (
    <div>
      <AdminHeader title="Collect fee" subtitle="Record a cash payment or collect online via Razorpay" />
      <div className="p-4 sm:p-6">
        <CollectFeeForm students={students} />
      </div>
    </div>
  );
}
