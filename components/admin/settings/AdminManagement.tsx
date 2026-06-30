"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ShieldCheck, Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface AdminRecord {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
  createdAt: string;
}

interface AdminManagementProps {
  admins: AdminRecord[];
  currentId: string;
}

export default function AdminManagement({ admins: initial, currentId }: AdminManagementProps) {
  const router = useRouter();
  const [admins, setAdmins] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  function updateForm<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`${data.name} added as ${data.role}.`);
      setAdmins((prev) => [data, ...prev]);
      setForm({ name: "", email: "", password: "", role: "admin" });
      setDialogOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from the admin panel? They will no longer be able to log in.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`${name} removed.`);
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove admin");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 text-navy-600">
            <Users className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-navy-700">Admin users</h2>
            <p className="text-xs text-muted-foreground">
              Manage who can access the admin panel
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Add admin
        </Button>
      </div>

      {/* Admin list */}
      <div className="divide-y divide-border">
        {admins.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">No admin users found.</p>
        ) : (
          admins.map((admin) => {
            const isMe = admin._id === currentId;
            return (
              <div key={admin._id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-sm font-semibold text-navy-700">
                    {admin.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{admin.name}</p>
                      {isMe && (
                        <span className="shrink-0 rounded-full bg-navy-100 px-2 py-0.5 text-[10px] font-medium text-navy-600">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Added {formatDate(admin.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={admin.role === "superadmin" ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {admin.role === "superadmin"
                      ? <><Crown className="h-3 w-3" /> Super Admin</>
                      : <><ShieldCheck className="h-3 w-3" /> Admin</>
                    }
                  </Badge>
                  {!isMe && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(admin._id, admin.name)}
                      disabled={deletingId === admin._id}
                      className="hover:bg-destructive/10 hover:text-destructive"
                      title="Remove admin"
                    >
                      {deletingId === admin._id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add admin user</DialogTitle>
            <DialogDescription>
              Create a new login for a staff member. They will receive access to the full admin panel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="a-name">Full name <span className="text-destructive">*</span></Label>
              <Input
                id="a-name"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="e.g. Priya Sharma"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="a-email">Email address <span className="text-destructive">*</span></Label>
              <Input
                id="a-email"
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder="staff@brightfuture.com"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="a-pass">Password <span className="text-destructive">*</span></Label>
              <Input
                id="a-pass"
                type="password"
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                placeholder="Min. 8 characters"
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => updateForm("role", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Admin — full access to student, fee, attendance and content management
                    </div>
                  </SelectItem>
                  <SelectItem value="superadmin">
                    <div className="flex items-center gap-2">
                      <Crown className="h-3.5 w-3.5" />
                      Super Admin — additionally can manage admin accounts
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Add admin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
