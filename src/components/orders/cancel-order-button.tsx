"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CancelOrderButtonProps {
  orderId: string;
  /** "link" = subtle text link (dashboard list); "button" = outlined button. */
  variant?: "link" | "button";
}

export function CancelOrderButton({ orderId, variant = "link" }: CancelOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function cancel() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={() => (confirming ? cancel() : setConfirming(true))}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
        {confirming ? "Confirm cancel" : "Cancel order"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (confirming ? cancel() : setConfirming(true))}
      disabled={loading}
      className={cn(
        "transition-colors hover:underline disabled:opacity-50",
        confirming ? "text-red-400" : "text-muted-foreground hover:text-red-400",
      )}
    >
      {loading ? "…" : confirming ? "Confirm?" : "Cancel"}
    </button>
  );
}
