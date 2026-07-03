import Link from "next/link";
import { Plus } from "lucide-react";
import AdminHeader from "@/components/admin/Header";
import FeesOverviewTable from "@/components/admin/fees/FeesOverviewTable";
import { Button } from "@/components/ui/button";
import { getStudentsWithFees } from "@/lib/data";

export default async function FeesPage() {
  const students = await getStudentsWithFees({ createdAt: -1 });

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
