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
  const [scrolled, setScrolled] = useState(false);
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

  // Soft shadow + slight height contraction once the page scrolls, so the
  // navbar reads as "lifted" above the content instead of static.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-white/85 backdrop-blur-md transition-shadow duration-300",
        scrolled ? "border-border/70 shadow-soft" : "border-transparent"
      )}
    >
      <div
        className={cn(
          "container-edge flex items-center justify-between gap-4 transition-[height] duration-300",
          scrolled ? "h-16" : "h-20"
        )}
      >
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy-600 to-navy-800 text-white shadow-soft transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-bold text-navy-700">Bright Future Academy</span>
            <span className="block text-[10px] tracking-wide text-muted-foreground">Building Strong Foundations</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 xl:flex">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative whitespace-nowrap py-2 text-sm font-medium transition-colors hover:text-navy-700",
                  active ? "text-navy-700" : "text-foreground/70"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-0.5 rounded-full bg-gradient-to-r from-navy-600 to-accent transition-all duration-300 ease-out",
                    active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right CTAs */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Phone */}
          <a
            href="tel:+919876543210"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 text-navy-700 transition-colors">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <span className="hidden whitespace-nowrap xl:block">
              <span className="block text-[10px] font-normal leading-none text-muted-foreground">Call Us</span>
              <span className="text-xs font-semibold">+91 98765 43210</span>
            </span>
          </a>

          {/* Enquire Now — Blue primary */}
          <Link
            href="/contact"
            className="rounded-xl bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-premium"
          >
            Enquire Now
          </Link>

          {/* Pay Fees — Orange */}
          <Link
            href="/pay-fees"
            className="rounded-xl bg-gradient-to-r from-accent to-saffron-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-accent"
          >
            Pay Fees
          </Link>

          {/* Admin login ghost */}
          <Link
            href={adminHref}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-200 hover:bg-secondary hover:text-navy-700"
            title={isLoggedIn ? "Admin Dashboard" : "Admin Login"}
          >
            {isLoggedIn ? <LayoutDashboard className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-secondary lg:hidden"
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
            className="fixed inset-0 top-16 z-30 bg-navy-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-40 animate-scale-in border-t border-border bg-white lg:hidden" style={{ transformOrigin: "top" }}>
            <nav className="container-edge flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary",
                      active ? "bg-navy-50 text-navy-700" : "text-foreground/80"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <Link
                  href="/contact"
                  className="flex-1 rounded-xl bg-navy-700 py-2.5 text-center text-sm font-semibold text-white shadow-soft"
                >
                  Enquire Now
                </Link>
                <Link
                  href="/pay-fees"
                  className="flex-1 rounded-xl bg-gradient-to-r from-accent to-saffron-600 py-2.5 text-center text-sm font-semibold text-white shadow-soft"
                >
                  Pay Fees
                </Link>
              </div>
              <Link
                href={adminHref}
                className="mt-1 flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground"
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
