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
