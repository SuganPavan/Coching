"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import RazorpayButton from "@/components/admin/fees/RazorpayButton";
import { formatCurrency, PAYMENT_METHODS } from "@/lib/utils";
import type { StudentDTO } from "@/types";

export default function CollectFeeForm({ students }: { students: StudentDTO[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentDTO | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("cash");
  const [month, setMonth] = useState(new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }));
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const searchResults = useMemo(() => {
    if (!search || selectedStudent) return [];
    return students
      .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.includes(search))
      .slice(0, 6);
  }, [search, students, selectedStudent]);

  function selectStudent(s: StudentDTO) {
    setSelectedStudent(s);
    setSearch(`${s.name} (${s.rollNo})`);
    setAmount(s.pendingFee > 0 ? String(s.pendingFee) : "");
  }

  function clearStudent() {
    setSelectedStudent(null);
    setSearch("");
    setAmount("");
  }

  async function handleCashSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("Please select a student first.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          amount: Number(amount),
          paymentMethod: method,
          month,
          remarks,
        }),
      });
      if (!res.ok) throw new Error("Failed to record payment");

      toast.success("Payment recorded successfully.");
      router.push("/admin/fees");
      router.refresh();
    } catch {
      toast.error("Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRazorpaySuccess() {
    router.push("/admin/fees");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-lg border border-border bg-card p-6">
      <div className="space-y-1.5">
        <Label>Search student</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (selectedStudent) setSelectedStudent(null);
            }}
            className="pl-9"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="rounded-md border border-border">
            {searchResults.map((s) => (
              <button
                key={s._id}
                onClick={() => selectStudent(s)}
                className="flex w-full items-center justify-between border-b border-border px-3 py-2.5 text-left text-sm last:border-0 hover:bg-secondary"
                type="button"
              >
                <span>
                  {s.name} <span className="text-muted-foreground">({s.rollNo})</span>
                </span>
                <span className="text-muted-foreground">{s.class}</span>
              </button>
            ))}
          </div>
        )}
        {selectedStudent && (
          <button type="button" onClick={clearStudent} className="text-xs text-navy-600 hover:underline">
            Change student
          </button>
        )}
      </div>

      {selectedStudent && (
        <>
          <div className="rounded-md bg-secondary/60 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total fee</span>
              <span className="font-medium">{formatCurrency(selectedStudent.totalFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid so far</span>
              <span className="font-medium text-success">{formatCurrency(selectedStudent.feesPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-medium text-saffron-600">{formatCurrency(selectedStudent.pendingFee)}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="month">For month</Label>
              <Input id="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Payment method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.filter((m) => m !== "razorpay").map((m) => (
                  <SelectItem key={m} value={m}>
                    {m === "upi" ? "UPI" : m.charAt(0).toUpperCase() + m.slice(1)}
                  </SelectItem>
                ))}
                <SelectItem value="razorpay">Razorpay (online)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {method !== "razorpay" && (
            <div className="space-y-1.5">
              <Label htmlFor="remarks">Remarks (optional)</Label>
              <Input id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
          )}

          {method === "razorpay" ? (
            <RazorpayButton
              studentId={selectedStudent._id}
              studentName={selectedStudent.name}
              studentPhone={selectedStudent.phone}
              amount={Number(amount) || 0}
              month={month}
              onSuccess={handleRazorpaySuccess}
            />
          ) : (
            <Button onClick={handleCashSubmit} className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Record payment
            </Button>
          )}
        </>
      )}
    </div>
  );
}
