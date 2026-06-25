"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface RankRow {
  id: string;
  name: string;
  minMmr: number;
  maxMmr: number;
  pricePer100: number; // centavos
}
interface ModRow {
  id: string;
  label: string;
  kind: "MULTIPLIER" | "FLAT";
  value: number; // bp or centavos
  isActive: boolean;
}

export function PricingEditor({
  ranks,
  modifiers,
}: {
  ranks: RankRow[];
  modifiers: ModRow[];
}) {
  const router = useRouter();
  // Pesos for rank rates (centavos / 100).
  const [rankPx, setRankPx] = useState<Record<string, number>>(
    Object.fromEntries(ranks.map((r) => [r.id, r.pricePer100 / 100])),
  );
  // Multiplier → percent uplift; flat → pesos.
  const [modVal, setModVal] = useState<Record<string, number>>(
    Object.fromEntries(
      modifiers.map((m) => [m.id, m.kind === "MULTIPLIER" ? Math.round((m.value / 10000 - 1) * 100) : m.value / 100]),
    ),
  );
  const [modActive, setModActive] = useState<Record<string, boolean>>(
    Object.fromEntries(modifiers.map((m) => [m.id, m.isActive])),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        ranks: ranks.map((r) => ({
          id: r.id,
          pricePer100: Math.round((rankPx[r.id] ?? 0) * 100),
        })),
        modifiers: modifiers.map((m) => ({
          id: m.id,
          value:
            m.kind === "MULTIPLIER"
              ? 10000 + Math.round((modVal[m.id] ?? 0) * 100)
              : Math.round((modVal[m.id] ?? 0) * 100),
          isActive: modActive[m.id],
        })),
      };
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.error ?? "Save failed.");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* MMR band rates */}
      <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="font-display text-lg font-semibold text-white">MMR boost rates</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Price per 100 MMR within each medal band. Higher = pricier climbs.
        </p>
        <div className="mt-5 space-y-3">
          {ranks
            .filter((r) => r.maxMmr > 0)
            .map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-medium text-white">{r.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {r.minMmr}–{r.maxMmr} MMR
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">₱</span>
                  <Input
                    type="number"
                    min={0}
                    value={rankPx[r.id] ?? 0}
                    onChange={(e) => setRankPx((s) => ({ ...s, [r.id]: Number(e.target.value) }))}
                    className="h-9 w-28 text-right"
                  />
                  <span className="text-xs text-muted-foreground">/ 100 MMR</span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Modifiers */}
      <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Modifiers &amp; add-ons</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Duo, Express, Priority, etc. Multipliers are an uplift %; flat fees are pesos.
        </p>
        <div className="mt-5 space-y-3">
          {modifiers.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-medium text-white">{m.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">{m.kind}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {m.kind === "FLAT" && <span className="text-sm text-muted-foreground">₱</span>}
                  <Input
                    type="number"
                    min={0}
                    value={modVal[m.id] ?? 0}
                    onChange={(e) => setModVal((s) => ({ ...s, [m.id]: Number(e.target.value) }))}
                    className="h-9 w-24 text-right"
                  />
                  {m.kind === "MULTIPLIER" && <span className="text-sm text-muted-foreground">%</span>}
                </div>
                <Switch
                  checked={modActive[m.id] ?? true}
                  onCheckedChange={(v) => setModActive((s) => ({ ...s, [m.id]: v }))}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Save pricing
        </Button>
        {saved && <span className="text-sm text-emerald-300">Saved ✓</span>}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </div>
  );
}
