"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import FacultyFormDialog from "@/components/admin/faculty/FacultyFormDialog";
import type { FacultyDTO } from "@/types";

export default function FacultyManager({ faculty }: { faculty: FacultyDTO[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyDTO | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAdd() {
    setEditingFaculty(undefined);
    setDialogOpen(true);
  }

  function openEdit(f: FacultyDTO) {
    setEditingFaculty(f);
    setDialogOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from active faculty list?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/faculty/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${name} removed.`);
      router.refresh();
    } catch {
      toast.error("Failed to remove faculty.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add faculty
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculty.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No faculty added yet.
                </TableCell>
              </TableRow>
            ) : (
              faculty.map((f) => (
                <TableRow key={f._id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 text-navy-600">
                        <Users className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{f.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{f.qualification}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {f.subjects.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{f.experience}+ years</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(f)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(f._id, f.name)} disabled={deletingId === f._id}>
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

      <FacultyFormDialog open={dialogOpen} onOpenChange={setDialogOpen} faculty={editingFaculty} />
    </div>
  );
}
