"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UploadCloud, X, User } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { FacultyDTO } from "@/types";

interface FacultyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty?: FacultyDTO;
}

export default function FacultyFormDialog({ open, onOpenChange, faculty }: FacultyFormDialogProps) {
  const router = useRouter();
  const isEdit = !!faculty;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: faculty?.name || "",
    qualification: faculty?.qualification || "",
    subjects: faculty?.subjects.join(", ") || "",
    experience: faculty?.experience?.toString() || "",
    phone: faculty?.phone || "",
    email: faculty?.email || "",
    bio: faculty?.bio || "",
  });

  const [photoUrl, setPhotoUrl] = useState<string>(faculty?.photo || "");
  const [photoPreview, setPhotoPreview] = useState<string>(faculty?.photo || "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5 MB.");
      return;
    }
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, or WebP photos are allowed.");
      return;
    }

    // Show preview immediately while uploading
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "faculty");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setPhotoUrl(data.url);
      toast.success("Photo uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Photo upload failed.");
      setPhotoPreview(faculty?.photo || "");
      setPhotoUrl(faculty?.photo || "");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  }

  function removePhoto() {
    setPhotoUrl("");
    setPhotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.qualification || !form.subjects || !form.experience || !form.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (uploading) {
      toast.error("Please wait for the photo to finish uploading.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        qualification: form.qualification,
        subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
        experience: Number(form.experience),
        phone: form.phone,
        email: form.email || undefined,
        bio: form.bio || undefined,
        photo: photoUrl || undefined,
      };

      const res = await fetch(isEdit ? `/api/faculty/${faculty._id}` : "/api/faculty", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save faculty");

      toast.success(isEdit ? "Faculty updated." : "Faculty added.");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit faculty" : "Add faculty"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Photo upload ── */}
          <div className="space-y-1.5">
            <Label>Photo</Label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                {photoPreview ? (
                  <>
                    <Image
                      src={photoPreview}
                      alt="Faculty photo preview"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                    {!uploading && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                        title="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {uploading
                      ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      : <User className="h-7 w-7 text-gray-300" />
                    }
                  </div>
                )}
              </div>

              {/* Upload button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="faculty-photo"
                />
                <label
                  htmlFor="faculty-photo"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary ${uploading ? "pointer-events-none opacity-50" : ""}`}
                >
                  <UploadCloud className="h-4 w-4" />
                  {uploading ? "Uploading…" : "Choose photo"}
                </label>
                <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG or WebP · max 5 MB</p>
              </div>
            </div>
          </div>

          {/* ── Name ── */}
          <div className="space-y-1.5">
            <Label htmlFor="f-name">Full name <span className="text-destructive">*</span></Label>
            <Input id="f-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Mr. Rajesh Kumar" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="f-qual">Qualification <span className="text-destructive">*</span></Label>
              <Input id="f-qual" value={form.qualification} onChange={(e) => update("qualification", e.target.value)} placeholder="e.g. M.Sc. Physics" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-exp">Experience (years) <span className="text-destructive">*</span></Label>
              <Input id="f-exp" type="number" min={0} value={form.experience} onChange={(e) => update("experience", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="f-subjects">Subjects (comma separated) <span className="text-destructive">*</span></Label>
            <Input id="f-subjects" value={form.subjects} onChange={(e) => update("subjects", e.target.value)} placeholder="e.g. Physics, Practical Physics" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="f-phone">Phone <span className="text-destructive">*</span></Label>
              <Input id="f-phone" value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-email">Email</Label>
              <Input id="f-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="f-bio">Bio <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Textarea id="f-bio" value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || uploading}>
              {(submitting || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add faculty"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
