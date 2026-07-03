"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Phone, BookOpen, IndianRupee, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn, CLASS_OPTIONS } from "@/lib/utils";
import type { StudentDTO } from "@/types";

interface StudentFormProps {
  student?: StudentDTO;
}

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-50 text-navy-600">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <h3 className="text-sm font-semibold text-navy-700">{title}</h3>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" />{msg}</p>;
}

export default function StudentForm({ student }: StudentFormProps) {
  const router = useRouter();
  const isEdit = !!student;

  const [form, setForm] = useState({
    name: student?.name || "",
    class: student?.class || "",
    subjects: student?.subjects.join(", ") || "",
    phone: student?.phone || "",
    parentPhone: student?.parentPhone || "",
    email: student?.email || "",
    address: student?.address || "",
    totalFee: student?.totalFee?.toString() || "",
    feesPaid: student?.feesPaid?.toString() || "0",
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.class) e.class = "Class is required";
    if (!form.phone || !/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.parentPhone || !/^\d{10}$/.test(form.parentPhone)) e.parentPhone = "Enter a valid 10-digit mobile number";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.totalFee || Number(form.totalFee) < 0) e.totalFee = "Enter a valid fee amount";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors below.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        class: form.class,
        subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
        phone: form.phone,
        parentPhone: form.parentPhone,
        email: form.email.trim() || undefined,
        address: form.address.trim(),
        totalFee: Number(form.totalFee),
        // Only send an initial feesPaid when creating a new student (no Fee
        // ledger exists yet). On edit this is ignored by the API anyway —
        // the ledger (via Collect Fee / Razorpay) is the only source of
        // truth for an existing student's feesPaid, so it's omitted here
        // to avoid ever appearing to "resubmit" a stale value.
        ...(isEdit ? {} : { feesPaid: Number(form.feesPaid) || 0 }),
      };

      const res = await fetch(isEdit ? `/api/students/${student._id}` : "/api/students", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save student");
      }

      toast.success(isEdit ? "Student updated successfully." : "Student added successfully.");
      router.push("/admin/students");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const feeProgress =
    form.totalFee && Number(form.totalFee) > 0
      ? Math.min(Math.round((Number(form.feesPaid) / Number(form.totalFee)) * 100), 100)
      : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Personal Info ─────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <SectionHeading icon={User} title="Personal information" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
            />
            <FieldError msg={errors.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="class">Class <span className="text-destructive">*</span></Label>
            <Select value={form.class} onValueChange={(v) => update("class", v)}>
              <SelectTrigger id="class" className={cn(errors.class && "border-destructive")}>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError msg={errors.class} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Full address"
            className={cn(errors.address && "border-destructive focus-visible:ring-destructive")}
          />
          <FieldError msg={errors.address} />
        </div>
      </div>

      {/* ── Contact Info ──────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <SectionHeading icon={Phone} title="Contact details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Student phone <span className="text-destructive">*</span></Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile"
              inputMode="numeric"
              className={cn(errors.phone && "border-destructive focus-visible:ring-destructive")}
            />
            <FieldError msg={errors.phone} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="parentPhone">Parent phone <span className="text-destructive">*</span></Label>
            <Input
              id="parentPhone"
              value={form.parentPhone}
              onChange={(e) => update("parentPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile"
              inputMode="numeric"
              className={cn(errors.parentPhone && "border-destructive focus-visible:ring-destructive")}
            />
            <FieldError msg={errors.parentPhone} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="student@example.com"
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
          />
          <FieldError msg={errors.email} />
        </div>
      </div>

      {/* ── Academic Info ─────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <SectionHeading icon={BookOpen} title="Academic details" />
        <div className="space-y-1.5">
          <Label htmlFor="subjects">Subjects <span className="text-muted-foreground text-xs">(comma separated)</span></Label>
          <Input
            id="subjects"
            value={form.subjects}
            onChange={(e) => update("subjects", e.target.value)}
            placeholder="e.g. Physics, Chemistry, Mathematics"
          />
          {form.subjects && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.subjects.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                <span key={s} className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Fee Info ──────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <SectionHeading icon={IndianRupee} title="Fee details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="totalFee">Total fee (₹) <span className="text-destructive">*</span></Label>
            <Input
              id="totalFee"
              type="number"
              min={0}
              value={form.totalFee}
              onChange={(e) => update("totalFee", e.target.value)}
              placeholder="e.g. 60000"
              className={cn(errors.totalFee && "border-destructive focus-visible:ring-destructive")}
            />
            <FieldError msg={errors.totalFee} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="feesPaid">Fees paid so far (₹)</Label>
            {isEdit ? (
              <>
                <Input
                  id="feesPaid"
                  type="number"
                  value={form.feesPaid}
                  disabled
                  className="bg-secondary/60 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Calculated from payment records. Use{" "}
                  <a href="/admin/fees/collect" className="underline hover:text-navy-600">
                    Collect fee
                  </a>{" "}
                  to record a new payment.
                </p>
              </>
            ) : (
              <Input
                id="feesPaid"
                type="number"
                min={0}
                value={form.feesPaid}
                onChange={(e) => update("feesPaid", e.target.value)}
                placeholder="e.g. 20000"
              />
            )}
          </div>
        </div>

        {/* Live fee progress preview */}
        {form.totalFee && Number(form.totalFee) > 0 && (
          <div className="rounded-lg bg-secondary/60 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Fee progress</span>
              <span className="font-medium">{feeProgress}% paid</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  feeProgress === 100 ? "bg-success" : feeProgress >= 50 ? "bg-saffron-500" : "bg-destructive"
                )}
                style={{ width: `${feeProgress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Paid: ₹{Number(form.feesPaid || 0).toLocaleString("en-IN")}</span>
              <span>Pending: ₹{Math.max(Number(form.totalFee || 0) - Number(form.feesPaid || 0), 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ───────────────────────────────── */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/students")}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="min-w-[130px]">
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : (
            isEdit ? "Save changes" : "Add student"
          )}
        </Button>
      </div>
    </form>
  );
}
