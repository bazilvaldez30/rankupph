"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandHelping, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClaimOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/provider/orders/${orderId}/claim`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not claim this order.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button size="sm" onClick={claim} disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <HandHelping className="size-4" />}
        Claim order
      </Button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
