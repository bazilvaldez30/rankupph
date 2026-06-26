import { Gift } from "lucide-react";
import type { FirstOrderOffer } from "@/lib/promo";
import { cn } from "@/lib/utils";

/**
 * Premium first-order promo banner. Renders nothing unless the offer is active
 * and the visitor is actually eligible — never show a discount that won't apply.
 */
export function FirstOrderBanner({
  offer,
  className,
}: {
  offer: FirstOrderOffer;
  className?: string;
}) {
  if (!offer.active || !offer.eligible) return null;

  const limited =
    offer.endsAt != null && new Date(offer.endsAt).getTime() > Date.now();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-r from-gold/[0.10] via-gold/[0.05] to-transparent px-5 py-4 sm:px-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08] text-gold">
          <Gift className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base font-semibold text-white">
              First Order Special — Save {offer.percent}%
            </p>
            {limited && (
              <span className="rounded-full border border-gold/30 bg-gold/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">
                Limited-time welcome offer
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your {offer.percent}% welcome discount is applied automatically at
            checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
