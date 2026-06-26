"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-gold/40 focus-visible:outline-none";
const labelCls = "text-xs font-medium uppercase tracking-wider text-muted-foreground";

export function VoucherCreateForm() {
  const router = useRouter();
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDone(null);
    const f = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = f.get(k);
      return v && String(v).trim() !== "" ? Number(v) : undefined;
    };

    const payload = {
      code: String(f.get("code") ?? "").trim(),
      description: String(f.get("description") ?? "").trim() || undefined,
      type,
      value: Number(f.get("value")),
      active: true,
      firstOrderOnly: f.get("firstOrderOnly") === "on",
      minSubtotalPhp: num("minSubtotalPhp"),
      maxRedemptions: num("maxRedemptions"),
      expiresAt: f.get("expiresAt")
        ? new Date(String(f.get("expiresAt"))).toISOString()
        : null,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not create voucher.");
        return;
      }
      setDone(`Created ${data.voucher.code}`);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass rounded-3xl p-6 sm:p-7"
    >
      <h2 className="font-display text-lg font-semibold text-white">
        Create voucher
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Code</label>
          <input
            name="code"
            required
            placeholder="e.g. SUMMER50"
            className={cn(inputCls, "mt-1.5 uppercase tracking-wider")}
            onInput={(e) =>
              (e.currentTarget.value = e.currentTarget.value.toUpperCase())
            }
          />
        </div>

        <div>
          <label className={labelCls}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}
            className={cn(inputCls, "mt-1.5")}
          >
            <option value="PERCENT">Percentage (%)</option>
            <option value="FIXED">Fixed (₱)</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>
            {type === "PERCENT" ? "Percent off (1–100)" : "Amount off (₱)"}
          </label>
          <input
            name="value"
            type="number"
            required
            min={1}
            step={type === "PERCENT" ? 1 : 0.01}
            placeholder={type === "PERCENT" ? "25" : "250"}
            className={cn(inputCls, "mt-1.5")}
          />
        </div>

        <div>
          <label className={labelCls}>Min order ₱ (optional)</label>
          <input
            name="minSubtotalPhp"
            type="number"
            min={0}
            step={0.01}
            placeholder="No minimum"
            className={cn(inputCls, "mt-1.5")}
          />
        </div>

        <div>
          <label className={labelCls}>Max redemptions (optional)</label>
          <input
            name="maxRedemptions"
            type="number"
            min={1}
            step={1}
            placeholder="Unlimited"
            className={cn(inputCls, "mt-1.5")}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Expires (optional)</label>
          <input name="expiresAt" type="date" className={cn(inputCls, "mt-1.5")} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Description (optional)</label>
          <input
            name="description"
            maxLength={120}
            placeholder="Internal note shown to admins"
            className={cn(inputCls, "mt-1.5")}
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-foreground sm:col-span-2">
          <input
            name="firstOrderOnly"
            type="checkbox"
            className="size-4 accent-gold"
          />
          First-order customers only
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {done && <p className="mt-4 text-sm text-emerald-400">{done}</p>}

      <Button type="submit" disabled={loading} className="mt-5 w-full sm:w-auto">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Create voucher
      </Button>
    </form>
  );
}
