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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef2f7] to-[#f6f8fb] py-16">
        <div className="pointer-events-none absolute -right-14 -top-10 h-64 w-64 rounded-full bg-saffron-200/40 blur-3xl" aria-hidden="true" />
        <div className="container-edge relative text-center">
          <h1 className="font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">Gallery</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Moments from classes, events, and campus life at Bright Future Academy.
          </p>
        </div>
      </section>

      <section className="container-edge py-16">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20 py-20 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <p className="mt-2 text-sm">Gallery images will appear here once uploaded by the admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <div
                key={img._id.toString()}
                className="group relative aspect-square overflow-hidden rounded-2xl shadow-soft transition-shadow duration-300 hover:shadow-premium"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/70 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
