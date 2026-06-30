"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { CourseDTO } from "@/types";

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: CourseDTO;
}

export default function CourseFormDialog({ open, onOpenChange, course }: CourseFormDialogProps) {
  const router = useRouter();
  const isEdit = !!course;

  const [form, setForm] = useState({
    name: course?.name || "",
    class: course?.class || "XI & XII",
    stream: course?.stream || "Science",
    subjects: course?.subjects.join(", ") || "",
    duration: course?.duration || "2 Years",
    fee: course?.fee?.toString() || "",
    description: course?.description || "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.fee || !form.duration) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        class: form.class,
        stream: form.stream,
        subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
        duration: form.duration,
        fee: Number(form.fee),
        description: form.description || undefined,
      };

      const res = await fetch(isEdit ? `/api/courses/${course._id}` : "/api/courses", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save course");

      toast.success(isEdit ? "Course updated." : "Course added.");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit course" : "Add course"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="c-name">Course name *</Label>
            <Input id="c-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Science (PCM)" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Class *</Label>
              <Select value={form.class} onValueChange={(v) => update("class", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XI">XI</SelectItem>
                  <SelectItem value="XII">XII</SelectItem>
                  <SelectItem value="XI & XII">XI &amp; XII</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Stream *</Label>
              <Select value={form.stream} onValueChange={(v) => update("stream", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Commerce">Commerce</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-subjects">Subjects (comma separated)</Label>
            <Input id="c-subjects" value={form.subjects} onChange={(e) => update("subjects", e.target.value)} placeholder="e.g. Physics, Chemistry, Mathematics" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-duration">Duration *</Label>
              <Input id="c-duration" value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="e.g. 2 Years" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-fee">Fee (₹) *</Label>
              <Input id="c-fee" type="number" min={0} value={form.fee} onChange={(e) => update("fee", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-desc">Description (optional)</Label>
            <Textarea id="c-desc" value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
