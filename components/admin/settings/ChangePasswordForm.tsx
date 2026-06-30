"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ChangePasswordForm({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!currentPassword) e.currentPassword = "Current password is required";
    if (!newPassword || newPassword.length < 8) e.newPassword = "New password must be at least 8 characters";
    if (newPassword !== confirmPassword) e.confirmPassword = "Passwords do not match";
    if (newPassword === currentPassword) e.newPassword = "New password must be different from current password";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 text-navy-600">
          <KeyRound className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-navy-700">Change password</h2>
          <p className="text-xs text-muted-foreground">Logged in as {email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        <div className="space-y-1.5">
          <Label htmlFor="current-pw">Current password</Label>
          <div className="relative">
            <Input
              id="current-pw"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setErrors((err) => ({ ...err, currentPassword: "" })); }}
              placeholder="••••••••"
              className="pr-10"
            />
            <button type="button" onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}>
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-pw">New password</Label>
          <div className="relative">
            <Input
              id="new-pw"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors((err) => ({ ...err, newPassword: "" })); }}
              placeholder="Min. 8 characters"
              className="pr-10"
            />
            <button type="button" onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}>
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-pw">Confirm new password</Label>
          <Input
            id="confirm-pw"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrors((err) => ({ ...err, confirmPassword: "" })); }}
            placeholder="Re-enter new password"
          />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
        </div>

        {/* Strength hint */}
        {newPassword.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => {
                const strength =
                  (newPassword.length >= 8 ? 1 : 0) +
                  (/[A-Z]/.test(newPassword) ? 1 : 0) +
                  (/[0-9]/.test(newPassword) ? 1 : 0) +
                  (/[^A-Za-z0-9]/.test(newPassword) ? 1 : 0);
                return (
                  <div key={level} className={`h-1.5 flex-1 rounded-full transition-colors ${
                    level <= strength
                      ? strength <= 1 ? "bg-destructive"
                        : strength <= 2 ? "bg-saffron-500"
                        : strength <= 3 ? "bg-blue-400"
                        : "bg-success"
                      : "bg-border"
                  }`} />
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Use uppercase letters, numbers, and symbols to strengthen your password.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={submitting} className="min-w-[150px]">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : "Update password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
