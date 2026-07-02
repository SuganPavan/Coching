import Link from "next/link";
import { Plus } from "lucide-react";
import AdminHeader from "@/components/admin/Header";
import FeesOverviewTable from "@/components/admin/fees/FeesOverviewTable";
import { Button } from "@/components/ui/button";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import type { StudentDTO } from "@/types";

async function getStudents(): Promise<StudentDTO[]> {
  await dbConnect();
  const students = await Student.aggregate([
    { $match: { isActive: true } },
    {
      $addFields: {
        pendingFee: {
          $max: [{ $subtract: ["$totalFee", "$feesPaid"] }, 0],
        },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
  return JSON.parse(JSON.stringify(students));
}

export default async function FeesPage() {
  const students = await getStudents();

  return (
    <div>
      <AdminHeader title="Fee management" subtitle="Track and collect student fees" />
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex justify-end">
          <Button asChild>
            <Link href="/admin/fees/collect">
              <Plus className="h-4 w-4" /> Collect fee
            </Link>
          </Button>
        </div>
        <FeesOverviewTable students={students} />
      </div>
    </div>
  );
}
