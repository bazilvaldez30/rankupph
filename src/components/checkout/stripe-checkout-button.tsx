"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StripeCheckoutButton({ orderNumber }: { orderNumber: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data?.error ?? "Could not start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.url; // redirect to Stripe Checkout
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button size="lg" className="w-full" onClick={pay} disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
        Pay with Card
      </Button>
      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
