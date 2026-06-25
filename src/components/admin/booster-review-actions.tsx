"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BoosterReviewActions({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function review(action: "approve" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/boosters/${profileId}/review`, {
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
      <Button size="sm" onClick={() => review("approve")} disabled={loading !== null}>
        {loading === "approve" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
        Approve
      </Button>
      <Button size="sm" variant="secondary" onClick={() => review("reject")} disabled={loading !== null}>
        {loading === "reject" ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
        Reject
      </Button>
    </div>
  );
}
