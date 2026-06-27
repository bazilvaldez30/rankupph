"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

/**
 * Promo-code input on the checkout page. Applies/removes a voucher against the
 * real order on the server, then refreshes so totals reflect it.
 */
export function VoucherForm({
  orderId,
  appliedCode,
}: {
  orderId: string;
  appliedCode?: string | null;
}) {
  const router = useRouter();
  const t = useT();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function apply() {
    if (!code.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/voucher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not apply this voucher.");
        return;
      }
      setCode("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/voucher`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-gold/25 bg-gold/[0.06] px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-gold">
          <Tag className="size-4" />
          {appliedCode} {t("co.voucherApplied")}
        </span>
        <button
          type="button"
          onClick={remove}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
          {t("co.remove")}
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold/80"
      >
        <Tag className="size-4" />
        {t("co.haveVoucher")}
      </button>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder={t("co.enterCode")}
          autoFocus
          className={cn(
            "flex h-11 w-full rounded-xl border bg-white/[0.03] px-4 text-sm uppercase tracking-wider text-foreground placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/60 focus-visible:outline-none",
            error ? "border-red-500/40" : "border-white/10 focus-visible:border-gold/40",
          )}
        />
        <Button onClick={apply} disabled={loading || !code.trim()} className="shrink-0">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {t("co.apply")}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
