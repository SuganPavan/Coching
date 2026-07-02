import AdminHeader from "@/components/admin/Header";
import CollectFeeForm from "@/components/admin/fees/CollectFeeForm";
import { getStudentsWithFees } from "@/lib/data";

export default async function CollectFeePage() {
  const students = await getStudentsWithFees({ name: 1 });

  return (
    <div>
      <AdminHeader
        title="Collect fee"
        subtitle="Record a cash or UPI payment"
      />
      <div className="p-4 sm:p-6">
        <CollectFeeForm students={students} />
      </div>
    </div>
  );
}
