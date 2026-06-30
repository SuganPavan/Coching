"use client";

import { useState } from "react";
import { toast } from "sonner";
import Script from "next/script";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RazorpayButtonProps {
  studentId: string;
  studentName: string;
  studentPhone: string;
  amount: number;
  month: string;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function RazorpayButton({ studentId, studentName, studentPhone, amount, month, onSuccess }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    if (amount <= 0) {
      toast.error("Enter a valid amount before proceeding.");
      return;
    }

    setLoading(true);
    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, studentId }),
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Bright Future Academy",
        description: `Fee payment — ${studentName}`,
        order_id: order.id,
        prefill: { name: studentName, contact: studentPhone },
        theme: { color: "#1e3a5f" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, studentId, amount, month }),
            });
            if (!verifyRes.ok) throw new Error("Verification failed");
            toast.success("Payment successful and verified.");
            onSuccess();
          } catch {
            toast.error("Payment was made but verification failed. Please contact support with your payment ID.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      toast.error("Failed to start payment. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Button onClick={handlePayment} disabled={loading} variant="accent" className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        Pay now via Razorpay
      </Button>
    </>
  );
}
