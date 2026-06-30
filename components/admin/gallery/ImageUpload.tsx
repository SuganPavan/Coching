"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

export default function ImageUploadDialog({ open, onOpenChange, onUploaded }: ImageUploadDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setCategory("General");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload() {
    if (!file) {
      toast.error("Please select an image to upload.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please give the image a title.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "gallery");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }
      const { url, publicId } = await uploadRes.json();

      const saveRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, imageUrl: url, publicId }),
      });
      if (!saveRes.ok) throw new Error("Failed to save image record");

      toast.success("Image uploaded successfully.");
      reset();
      onOpenChange(false);
      onUploaded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="g-title">Title *</Label>
            <Input id="g-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Annual Day 2026" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-category">Category</Label>
            <Input id="g-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Events, Campus, Results" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-file">Image file *</Label>
            <div className="flex items-center gap-3 rounded-md border border-dashed border-border p-4">
              <UploadCloud className="h-5 w-5 text-muted-foreground" />
              <input
                ref={fileInputRef}
                id="g-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="flex-1 text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Max 5MB.</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
