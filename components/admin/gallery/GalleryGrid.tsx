"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageUploadDialog from "@/components/admin/gallery/ImageUpload";
import type { GalleryDTO } from "@/types";

export default function GalleryGrid({ images }: { images: GalleryDTO[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Image deleted.");
      router.refresh();
    } catch {
      toast.error("Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Upload image
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <p className="mt-2 text-sm">No images uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img._id} className="group relative overflow-hidden rounded-lg border border-border">
              <div className="relative aspect-square">
                <Image src={img.imageUrl} alt={img.title} fill className="object-cover" />
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-medium">{img.title}</p>
                {img.category && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {img.category}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => handleDelete(img._id, img.title)}
                disabled={deletingId === img._id}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                title="Delete image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ImageUploadDialog open={dialogOpen} onOpenChange={setDialogOpen} onUploaded={() => router.refresh()} />
    </div>
  );
}
