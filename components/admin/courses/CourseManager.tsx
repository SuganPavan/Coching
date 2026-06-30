"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import CourseFormDialog from "@/components/admin/courses/CourseFormDialog";
import { formatCurrency } from "@/lib/utils";
import type { CourseDTO } from "@/types";

export default function CourseManager({ courses }: { courses: CourseDTO[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDTO | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAdd() {
    setEditingCourse(undefined);
    setDialogOpen(true);
  }

  function openEdit(c: CourseDTO) {
    setEditingCourse(c);
    setDialogOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove "${name}" from active courses?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${name} removed.`);
      router.refresh();
    } catch {
      toast.error("Failed to remove course.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add course
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Stream</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No courses added yet.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 text-navy-600">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.class}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.stream}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.duration}</TableCell>
                  <TableCell>{formatCurrency(c.fee)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c._id, c.name)} disabled={deletingId === c._id}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CourseFormDialog open={dialogOpen} onOpenChange={setDialogOpen} course={editingCourse} />
    </div>
  );
}
