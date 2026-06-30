import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string;
  href: string;
  linkLabel: string;
  linkClassName?: string;
}

export default function DashboardStatCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  href,
  linkLabel,
  linkClassName,
}: DashboardStatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", iconClassName)}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-navy-700">{value}</p>
        </div>
      </div>
      <Link href={href} className={cn("mt-3 flex items-center gap-1 text-sm font-medium text-navy-600 hover:underline", linkClassName)}>
        {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
