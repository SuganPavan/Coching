"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Users, ClipboardCheck, IndianRupee,
  BookOpen, GraduationCap as FacultyIcon, Image as ImageIcon,
  MessageSquare, Settings, LogOut, GraduationCap, Menu, X, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Attendance", href: "/admin/attendance", icon: ClipboardCheck },
  { label: "Fees", href: "/admin/fees", icon: IndianRupee },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Faculty", href: "/admin/faculty", icon: FacultyIcon },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const adminName = session?.user?.name ?? "Admin";
  const adminEmail = session?.user?.email ?? "";
  const isSuperAdmin = (session?.user as { role?: string })?.role === "superadmin";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-navy-700 text-white">
            {/* Logo + close */}
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">Bright Future Academy</p>
                  <p className="text-xs text-white/55">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 px-3">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-white text-navy-700" : "text-white/75 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.label === "Settings" && isSuperAdmin && (
                      <Crown className="h-3 w-3 text-saffron-400" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User footer */}
            <div className="border-t border-white/10 px-3 py-4 space-y-1">
              <div className="flex items-center gap-2.5 rounded-md px-3 py-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                  {adminName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">{adminName}</p>
                  <p className="truncate text-xs text-white/50 leading-tight">{adminEmail}</p>
                </div>
                {isSuperAdmin && <Crown className="h-3.5 w-3.5 shrink-0 text-saffron-400" />}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
