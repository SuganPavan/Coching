import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

// Body copy — clean, highly legible workhorse face.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Display face for headings — geometric, confident, distinct from the body
// face so the type hierarchy reads clearly at a glance (premium SaaS feel).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bright Future Academy — Building Strong Foundations",
  description:
    "Bright Future Academy offers expert-led coaching for Class XI and XII students in Science, Commerce, and Arts streams. Small batches, regular tests, individual attention.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
