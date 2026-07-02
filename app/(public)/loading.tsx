import { GraduationCap } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-grid-fade">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-navy-100 border-t-navy-600" />
        <span className="absolute inset-0 animate-glow-pulse rounded-full bg-navy-100/40 blur-md" />
        <GraduationCap className="h-6 w-6 text-navy-600" />
      </div>
      <p className="text-sm text-muted-foreground">Loading Bright Future Academy…</p>
    </div>
  );
}
