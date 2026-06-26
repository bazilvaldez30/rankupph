"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

/**
 * Compact sticky checkout bar shown on mobile only (lg:hidden). Mirrors the
 * order summary's price + first-order discount and triggers checkout.
 */
export function MobileCheckoutBar({
  valid,
  total,
  discount,
  percent,
  submitting,
  onCheckout,
}: {
  valid: boolean;
  total: number;
  discount: number;
  percent: number;
  submitting: boolean;
  onCheckout: () => void;
}) {
  if (!valid) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-ink-900/95 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          {discount > 0 ? (
            <>
              <div className="flex items-baseline gap-2">
                <Price
                  centavos={total - discount}
                  className="font-display text-xl font-bold tabular-nums text-white"
                />
                <Price
                  centavos={total}
                  className="text-xs font-medium text-muted-foreground line-through"
                />
              </div>
              <p className="text-[11px] font-medium text-gold">
                First order −{percent}%
              </p>
            </>
          ) : (
            <Price
              centavos={total}
              className="font-display text-xl font-bold tabular-nums text-white"
            />
          )}
        </div>
        <Button
          size="lg"
          className="ml-auto shrink-0"
          disabled={submitting}
          onClick={onCheckout}
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Checkout
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
