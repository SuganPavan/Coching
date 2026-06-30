import Image from "next/image";
import { ImageIcon } from "lucide-react";
import dbConnect from "@/lib/db";
import Gallery from "@/models/Gallery";

async function getGallery() {
  await dbConnect();
  const images = await Gallery.find().sort({ createdAt: -1 }).lean();
  return images;
}

export default async function GalleryPage() {
  const images = await getGallery();

  return (
    <div>
      <section className="bg-secondary/40 py-14">
        <div className="container-edge text-center">
          <h1 className="text-3xl font-semibold text-navy-700 sm:text-4xl">Gallery</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Moments from classes, events, and campus life at Bright Future Academy.
          </p>
        </div>
      </section>

      <section className="container-edge py-16">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <p className="mt-2 text-sm">Gallery images will appear here once uploaded by the admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <div key={img._id.toString()} className="group relative aspect-square overflow-hidden rounded-md">
                <Image src={img.imageUrl} alt={img.title} fill className="object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-xs font-medium text-white">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
