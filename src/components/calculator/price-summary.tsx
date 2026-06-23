"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatCentavos } from "@/lib/format";
import type { QuoteResult } from "@/lib/pricing";

export function PriceSummary({
  quote,
  loading,
}: {
  quote: QuoteResult | undefined;
  loading: boolean;
}) {
  const invalid = quote && !quote.valid;

  return (
    <div className="space-y-4">
      {/* Breakdown */}
      <div className="space-y-2 text-sm">
        {quote?.valid &&
          quote.breakdown.map((line, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-muted-foreground"
            >
              <span>{line.label}</span>
              <span className="tabular-nums">
                {formatCentavos(line.amount)}
              </span>
            </div>
          ))}

        {quote?.valid && quote.modifiersApplied.length > 0 && (
          <div className="space-y-2 border-t border-white/[0.06] pt-2">
            {quote.modifiersApplied.map((line, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-gold/90"
              >
                <span>{line.label}</span>
                <span className="tabular-nums">
                  +{formatCentavos(line.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="rounded-2xl border border-gold/20 bg-gold/[0.04] p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Estimated total
            </p>
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
                className="text-sm font-medium text-amber-400"
              >
                {quote?.error}
              </motion.span>
            ) : (
              <motion.span
                key={quote?.total ?? "loading"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: loading ? 0.5 : 1, y: 0 }}
                className="font-display text-3xl font-bold tabular-nums text-white sm:text-4xl"
              >
                {quote?.valid ? formatCentavos(quote.total) : "—"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
