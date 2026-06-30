import AdminHeader from "@/components/admin/Header";
import EnquiryManager from "@/components/admin/enquiries/EnquiryManager";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import type { EnquiryDTO } from "@/types";

async function getEnquiries(): Promise<EnquiryDTO[]> {
  await dbConnect();
  const enquiries = await Enquiry.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(enquiries));
}

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <div>
      <AdminHeader title="Enquiries" subtitle="Manage admission enquiries from the website" />
      <div className="p-4 sm:p-6">
        <EnquiryManager enquiries={enquiries} />
      </div>
    </div>
  );
}
