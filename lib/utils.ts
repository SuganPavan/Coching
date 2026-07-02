import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Returns the UTC start (00:00:00.000) and end (next day 00:00:00.000,
 * exclusive) boundaries for a given date.
 *
 * Why this matters: an HTML <input type="date"> sends a plain date string
 * like "2026-06-30". `new Date("2026-06-30")` parses this as MIDNIGHT UTC,
 * not midnight in the server's local timezone. If day boundaries elsewhere
 * are computed using `.setHours(0,0,0,0)` (which uses the SERVER's local
 * timezone), the two "midnight" calculations disagree whenever the server
 * isn't running in UTC - causing attendance saved for "today" to fall
 * outside a dashboard query's "today" window, or duplicate-key errors when
 * the same logical day resolves to two different date ranges.
 *
 * Always use this helper (both when saving and when querying) so every
 * part of the app agrees on exactly where one day ends and the next begins.
 *
 * Accepts either a "YYYY-MM-DD" string or a Date object.
 */
export function getUTCDayBounds(date: Date | string): { start: Date; end: Date } {
  const dateStr = typeof date === "string" ? date : date.toISOString().slice(0, 10);
  const start = new Date(dateStr + "T00:00:00.000Z");
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

/** Returns today's date as a "YYYY-MM-DD" string, in UTC. */
export function todayUTCDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const random = String(Date.now()).slice(-6);
  return `BFA-${year}-${random}`;
}

export function generateRollNumber(prefix: number): string {
  return String(prefix);
}

export const CLASS_OPTIONS = [
  "XI Science",
  "XI Commerce",
  "XI Arts",
  "XII Science",
  "XII Commerce",
  "XII Arts",
] as const;

export const PAYMENT_METHODS = ["cash", "upi", "card", "netbanking", "razorpay"] as const;

export const ENQUIRY_STATUSES = ["new", "contacted", "enrolled", "closed"] as const;
