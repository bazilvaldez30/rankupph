"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentReviewActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function review(action: "approve" | "reject") {
    setError(null);
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Action failed.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => review("approve")} disabled={loading !== null}>
          {loading === "approve" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          Approve
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => (rejecting ? review("reject") : setRejecting(true))}
          disabled={loading !== null}
        >
          {loading === "reject" ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
          {rejecting ? "Confirm reject" : "Reject"}
        </Button>
      </div>
      {rejecting && (
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground focus-visible:outline-none"
        />
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
