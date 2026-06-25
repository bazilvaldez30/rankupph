"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProviderOrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "progress" | "complete", body: object = {}) {
    setError(null);
    setLoading(action);
    try {
      const res = await fetch(`/api/provider/orders/${orderId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Action failed.");
        return;
      }
      setNote("");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (status === "COMPLETED") {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-300">
        <CheckCircle2 className="size-4" /> Awaiting customer confirmation
      </p>
    );
  }
  if (["CONFIRMED", "CLOSED"].includes(status)) {
    return <p className="text-sm text-muted-foreground">Order completed & confirmed.</p>;
  }

  return (
    <div className="space-y-3">
      {status === "ASSIGNED" && (
        <Button size="sm" onClick={() => act("accept")} disabled={loading !== null}>
          {loading === "accept" && <Loader2 className="size-4 animate-spin" />}
          Accept order
        </Button>
      )}

      {(status === "IN_PROGRESS" || status === "ASSIGNED") && (
        <>
          <div className="flex gap-2">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Post a progress update for the customer…"
              className="h-9"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => note.trim() && act("progress", { note: note.trim() })}
              disabled={loading !== null || !note.trim()}
            >
              {loading === "progress" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Post
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => act("complete", note.trim() ? { note: note.trim() } : {})}
            disabled={loading !== null}
          >
            {loading === "complete" && <Loader2 className="size-4 animate-spin" />}
            Mark completed
          </Button>
        </>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
