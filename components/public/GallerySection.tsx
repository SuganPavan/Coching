import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import dbConnect from "@/lib/db";
import Gallery from "@/models/Gallery";

async function getGalleryPreview() {
  await dbConnect();
  const images = await Gallery.find().sort({ createdAt: -1 }).limit(5).lean();
  return images;
}

export default async function GallerySection() {
  const images = await getGalleryPreview();

  return (
    <section className="section-padding bg-white">
      <div className="container-edge">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">Life at Bright Future Academy</h2>
          <div className="mx-auto mt-2 h-0.5 w-12 rounded bg-navy-700" />
        </div>

        {images.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-gray-400">
            <ImageIcon className="h-8 w-8" />
            <p className="mt-2 text-sm">Gallery images will appear here once uploaded.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {images.map((img) => (
              <div
                key={img._id.toString()}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-7 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-full border-2 border-navy-700 px-7 py-2.5 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-700 hover:text-white"
          >
            View All Photos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
