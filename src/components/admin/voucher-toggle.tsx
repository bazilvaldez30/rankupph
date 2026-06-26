"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function VoucherToggle({
  voucherId,
  active,
}: {
  voucherId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(next: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vouchers/${voucherId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      {loading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
      <Switch checked={active} onCheckedChange={toggle} disabled={loading} />
    </span>
  );
}
