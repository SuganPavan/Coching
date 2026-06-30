"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X, GraduationCap, Phone, LayoutDashboard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Faculty", href: "/faculty" },
  { label: "Fee Structure", href: "/courses#fees" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact Us", href: "/contact" },
];

function isLinkActive(pathname: string, href: string) {
  const path = href.split("#")[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(path + "/");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session;
  const adminHref = isLoggedIn ? "/admin/dashboard" : "/login";

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="container-edge flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-700 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-navy-700">Bright Future Academy</span>
            <span className="block text-[10px] text-muted-foreground">Building Strong Foundations</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 xl:flex">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap text-sm font-medium transition-colors hover:text-navy-700",
                  active ? "text-navy-700" : "text-foreground/70"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-navy-700" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTAs */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Phone */}
          <a
            href="tel:+919876543210"
            className="flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-600"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-50">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <span className="hidden whitespace-nowrap xl:block">
              <span className="block text-[10px] font-normal text-muted-foreground leading-none">Call Us</span>
              <span className="text-xs font-semibold">+91 98765 43210</span>
            </span>
          </a>

          {/* Enquire Now — Blue primary */}
          <Link
            href="/contact"
            className="rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            Enquire Now
          </Link>

          {/* Pay Fees — Orange */}
          <Link
            href="/pay-fees"
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Pay Fees
          </Link>

          {/* Admin login ghost */}
          <Link
            href={adminHref}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-navy-700"
            title={isLoggedIn ? "Admin Dashboard" : "Admin Login"}
          >
            {isLoggedIn ? <LayoutDashboard className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-md p-2 text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-16 z-30 bg-black/30 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-40 border-t border-border bg-white lg:hidden">
            <nav className="container-edge flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary",
                      active ? "bg-secondary text-navy-700" : "text-foreground/80"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <Link
                  href="/contact"
                  className="flex-1 rounded-md bg-navy-700 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Enquire Now
                </Link>
                <Link
                  href="/pay-fees"
                  className="flex-1 rounded-md bg-orange-500 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Pay Fees
                </Link>
              </div>
              <Link
                href={adminHref}
                className="mt-1 flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                {isLoggedIn
                  ? <><LayoutDashboard className="h-4 w-4" /> Admin Dashboard</>
                  : <><ShieldCheck className="h-4 w-4" /> Admin Login</>
                }
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
