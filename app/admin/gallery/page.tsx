import AdminHeader from "@/components/admin/Header";
import GalleryGrid from "@/components/admin/gallery/GalleryGrid";
import dbConnect from "@/lib/db";
import Gallery from "@/models/Gallery";
import type { GalleryDTO } from "@/types";

async function getGallery(): Promise<GalleryDTO[]> {
  await dbConnect();
  const images = await Gallery.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(images));
}

export default async function AdminGalleryPage() {
  const images = await getGallery();

  return (
    <div>
      <AdminHeader title="Gallery" subtitle="Manage photos shown on the public website" />
      <div className="p-4 sm:p-6">
        <GalleryGrid images={images} />
      </div>
    </div>
  );
}
