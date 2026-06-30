"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CLASS_OPTIONS } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function EnquiryForm({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !studentClass) {
      toast.error("Please fill in name, mobile number, and class.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, class: studentClass, message }),
      });
      if (!res.ok) throw new Error("Failed to submit enquiry");

      toast.success("Enquiry submitted. We'll reach out to you shortly.");
      setName("");
      setPhone("");
      setStudentClass("");
      setMessage("");
    } catch {
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "mt-4 space-y-3" : "space-y-4"}>
      <div className={compact ? "" : "grid gap-4 sm:grid-cols-2"}>
        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        {!compact && <div className="mt-3 sm:mt-0" />}
      </div>
      <div className={compact ? "grid grid-cols-1 gap-3" : "grid gap-4 sm:grid-cols-2"}>
        <Input
          placeholder="Mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          inputMode="numeric"
        />
        <Select value={studentClass} onValueChange={setStudentClass}>
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {CLASS_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder="Your message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={compact ? 3 : 4}
      />
      <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit enquiry
      </Button>
    </form>
  );
}
