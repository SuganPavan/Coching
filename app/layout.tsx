import type { Metadata } from "next";
import { Toaster } from "sonner";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bright Future Academy — Building Strong Foundations",
  description:
    "Bright Future Academy offers expert-led coaching for Class XI and XII students in Science, Commerce, and Arts streams. Small batches, regular tests, individual attention.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
