import { GraduationCap } from "lucide-react";

/**
 * This file is picked up automatically by Next.js App Router.
 * It renders whenever any /admin/* page is loading server-side data
 * (including on first navigation to a page and on route changes).
 * No manual wiring needed — Next.js wraps the route segment in
 * a Suspense boundary using this component as the fallback.
 */
export default function AdminLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
      {/* Spinner ring with academy icon in the centre */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-navy-100 border-t-navy-600" />
        <GraduationCap className="h-7 w-7 text-navy-600" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Loading…</p>
    </div>
  );
}
