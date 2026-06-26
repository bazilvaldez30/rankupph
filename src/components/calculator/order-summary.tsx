"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Clock,
  Headphones,
  Loader2,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import type { ServiceQuote } from "@/hooks/use-quote";
import type { PublicRank, PublicService } from "@/lib/fallback-data";
import { firstOrderDiscount, type FirstOrderOffer } from "@/lib/promo";
import {
  medalImageForMmr,
  medalNameForMmr,
  rankLabelForMmr,
} from "@/lib/rank-medals";
import { Price } from "@/components/shared/price";
import { PurchaseProtection } from "@/components/shared/purchase-protection";
import { Button } from "@/components/ui/button";
import { RankMedal } from "./rank-medal";

export interface SummaryLine {
  label: string;
  value: string;
}

export interface Progression {
  current: { rank: PublicRank | null; mmr: number };
  target: { rank: PublicRank | null; mmr: number } | null;
  diff: number | null;
}

interface OrderSummaryProps {
  service: PublicService;
  quote: ServiceQuote | undefined;
  loading: boolean;
  progression: Progression | null;
  summaryLines: SummaryLine[];
  onCheckout: () => void;
  submitting: boolean;
  error: string | null;
  offer?: FirstOrderOffer;
}

const TRUST = [
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: Users, label: "Verified Players" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Headphones, label: "24/7 Support" },
];

function MedalRow({ mmr, label }: { mmr: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <RankMedal name={medalNameForMmr(mmr)} iconUrl={medalImageForMmr(mmr)} size="sm" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-sm font-semibold text-white">
          {rankLabelForMmr(mmr)}
          <span className="ml-1.5 font-sans text-xs font-normal text-muted-foreground">
            {mmr.toLocaleString()} MMR
          </span>
        </div>
      </div>
    </div>
  );
}

export function OrderSummary({
  service,
  quote,
  loading,
  progression,
  summaryLines,
  onCheckout,
  submitting,
  error,
  offer,
}: OrderSummaryProps) {
  const invalid = quote && !quote.valid;
  const applyDiscount = Boolean(offer?.active && offer?.eligible && quote?.valid);
  const discount = applyDiscount ? firstOrderDiscount(quote!.total) : 0;
  const finalTotal = quote?.valid ? quote.total - discount : 0;

  return (
    <div className="space-y-4">
      <div className="glass overflow-hidden rounded-3xl">
      <div className="border-b border-white/[0.06] px-6 py-5">
        <h3 className="font-display text-lg font-semibold text-white">Order Summary</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{service.title}</p>
      </div>

      <div className="space-y-5 px-6 py-5">
        {/* Rank progression */}
        {progression && (
          <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <MedalRow mmr={progression.current.mmr} label="Current" />
            {progression.target && (
              <>
                <ArrowDown className="ml-3 size-4 text-gold" />
                <MedalRow mmr={progression.target.mmr} label="Target" />
                {progression.diff != null && progression.diff > 0 && (
                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-sm">
                    <span className="text-muted-foreground">MMR difference</span>
                    <span className="font-medium text-gold">
                      +{progression.diff.toLocaleString()} MMR
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Selected configuration */}
        {summaryLines.length > 0 && (
          <dl className="space-y-2.5 text-sm">
            {summaryLines.map((line) => (
              <div key={line.label} className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{line.label}</dt>
                <dd className="text-right font-medium text-foreground">{line.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Price breakdown */}
        {quote?.valid && (
          <div className="space-y-2 border-t border-white/[0.06] pt-4 text-sm">
            {quote.breakdown.map((l, i) => (
              <div key={`b${i}`} className="flex justify-between text-muted-foreground">
                <span>{l.label}</span>
                <Price centavos={l.amount} className="tabular-nums" />
              </div>
            ))}
            {quote.optionsApplied.map((l, i) => (
              <div key={`o${i}`} className="flex justify-between text-muted-foreground">
                <span>{l.label}</span>
                <span className="tabular-nums">
                  +<Price centavos={l.amount} />
                </span>
              </div>
            ))}
            {quote.modifiersApplied.map((l, i) => (
              <div key={`m${i}`} className="flex justify-between text-gold/90">
                <span>{l.label}</span>
                <span className="tabular-nums">
                  +<Price centavos={l.amount} />
                </span>
              </div>
            ))}
            {discount > 0 && (
              <div className="flex justify-between border-t border-white/[0.06] pt-2 font-medium text-gold">
                <span>First-order discount ({offer!.percent}%)</span>
                <span className="tabular-nums">
                  −<Price centavos={discount} />
                </span>
              </div>
            )}
          </div>
        )}

        {/* Estimated delivery */}
        {quote?.valid && (
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm">
            <Clock className="size-4 text-gold" />
            <span className="text-muted-foreground">Estimated delivery</span>
            <span className="ml-auto font-medium text-foreground">
              {quote.estimatedDelivery}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="rounded-2xl border border-gold/20 bg-gold/[0.04] p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Final price confirmed at checkout
              </p>
            </div>
            <AnimatePresence mode="wait">
              {invalid ? (
                <motion.span
                  key="invalid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-[55%] text-right text-sm font-medium text-amber-400"
                >
                  {quote?.error}
                </motion.span>
              ) : (
                <motion.div
                  key={finalTotal || "loading"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: loading ? 0.5 : 1, y: 0 }}
                  className="text-right"
                >
                  {discount > 0 && (
                    <Price
                      centavos={quote!.total}
                      className="block text-sm font-medium text-muted-foreground line-through"
                    />
                  )}
                  <span className="font-display text-3xl font-bold tabular-nums text-white">
                    {quote?.valid ? <Price centavos={finalTotal} /> : "—"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {discount > 0 && (
            <p className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gold/[0.08] py-1.5 text-xs font-medium text-gold">
              🎉 You save <Price centavos={discount} /> on your first order
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </p>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={!quote?.valid || submitting}
          onClick={onCheckout}
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Continue to Checkout
          <ArrowRight className="size-4" />
        </Button>

        <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-5">
          {TRUST.map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-xs text-muted-foreground">
              <t.icon className="size-4 text-gold" />
              {t.label}
            </div>
          ))}
        </div>
      </div>
      </div>

      <PurchaseProtection />
    </div>
  );
}
