"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReviewModerationActions({
  reviewId,
  published,
}: {
  reviewId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "hide" | null>(null);

  async function moderate(action: "approve" | "hide") {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!published && (
        <Button size="sm" onClick={() => moderate("approve")} disabled={loading !== null}>
          {loading === "approve" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          Approve
        </Button>
      )}
      {published && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => moderate("hide")}
          disabled={loading !== null}
        >
          {loading === "hide" ? <Loader2 className="size-3.5 animate-spin" /> : <EyeOff className="size-3.5" />}
          Hide
        </Button>
      )}
    </div>
  );
}
