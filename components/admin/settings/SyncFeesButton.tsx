"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyncResult {
  studentsChecked: number;
  updated: number;
  alreadyCorrect: number;
}

export default function SyncFeesButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  async function handleSync() {
    if (!confirm("This will recompute every student's fee balance from the payment ledger. Continue?")) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/sync-fees", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Sync failed");

      setResult(data);
      toast.success(`Fee sync complete — ${data.updated} student${data.updated !== 1 ? "s" : ""} updated.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
          <RefreshCw className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-navy-700">Sync fee data</h2>
          <p className="text-xs text-muted-foreground">
            Recompute every student&apos;s balance from the actual payment records to fix any mismatch on the dashboard.
          </p>
        </div>
      </div>
      <div className="px-6 py-5">
        {result && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-success/30 bg-success/8 px-4 py-3 text-sm text-success">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Checked {result.studentsChecked} students —{" "}
              <strong>{result.updated}</strong> updated,{" "}
              <strong>{result.alreadyCorrect}</strong> already correct.
            </span>
          </div>
        )}
        <Button onClick={handleSync} disabled={loading} variant="outline">
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Syncing…</>
            : <><RefreshCw className="h-4 w-4" /> Sync fee balances</>
          }
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Safe to run multiple times. Only updates records that are out of sync.
        </p>
      </div>
    </div>
  );
}
