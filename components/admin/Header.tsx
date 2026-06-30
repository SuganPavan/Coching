import { ChevronDown } from "lucide-react";
import MobileSidebar from "@/components/admin/MobileSidebar";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  adminName?: string;
}

export default function AdminHeader({ title, subtitle, adminName = "Admin" }: AdminHeaderProps) {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", weekday: "long" });

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div>
          <h1 className="text-lg font-semibold text-navy-700 sm:text-xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground sm:block">
          {today}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-sm font-semibold text-navy-700">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium">{adminName}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </div>
      </div>
    </div>
  );
}
