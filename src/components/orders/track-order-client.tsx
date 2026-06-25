"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { Price } from "@/components/shared/price";

interface TrackResult {
  orderNumber: string;
  status: OrderStatus;
  service: { title: string; category: string };
  currentRank: string | null;
  currentStar: number | null;
  targetRank: string | null;
  targetStar: number | null;
  amount: number;
  currency: string;
  boosterName: string | null;
  latestProgress: number;
  createdAt: string;
}

export function TrackOrderClient() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (number: string) => {
    const trimmed = number.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Order not found.");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load when arriving with ?number=
  useEffect(() => {
    const fromUrl = params.get("number");
    if (fromUrl) {
      setOrderNumber(fromUrl);
      void lookup(fromUrl);
    }
  }, [params, lookup]);

  function rankLabel(rank: string | null, star: number | null) {
    if (!rank) return "—";
    return star ? `${rank} ${star}` : rank;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(orderNumber);
        }}
        className="flex gap-3"
      >
        <Input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Enter your order number (e.g. RUP-7K3D9Q)"
          className="h-12"
          autoCapitalize="characters"
        />
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          Track
        </Button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 glass rounded-3xl p-7 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Order
              </p>
              <p className="font-display text-2xl font-bold text-white">
                {result.orderNumber}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.service.title} · Placed {formatDate(result.createdAt)}
              </p>
            </div>
            <OrderStatusBadge status={result.status} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="mt-1 text-sm font-medium text-white">
                {rankLabel(result.currentRank, result.currentStar)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">To</p>
              <p className="mt-1 text-sm font-medium text-white">
                {rankLabel(result.targetRank, result.targetStar)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="mt-1 text-sm font-medium text-white">
                <Price centavos={result.amount} />
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-5 font-display text-base font-semibold text-white">
              Progress
            </h3>
            <OrderTimeline status={result.status} />
          </div>

          {result.boosterName && (
            <p className="mt-2 text-sm text-muted-foreground">
              Assigned booster:{" "}
              <span className="text-foreground">{result.boosterName}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
