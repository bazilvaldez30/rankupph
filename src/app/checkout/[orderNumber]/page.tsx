import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDown, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { features } from "@/lib/env";
import { formatCentavos } from "@/lib/format";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { RankMedal } from "@/components/calculator/rank-medal";
import { StripeCheckoutButton } from "@/components/checkout/stripe-checkout-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

interface BreakdownLine {
  label: string;
  amount: number;
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const normalized = orderNumber.toUpperCase();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/checkout/${normalized}`);

  const order = await prisma.order.findUnique({
    where: { orderNumber: normalized },
    include: {
      service: { select: { title: true } },
      currentRank: { select: { name: true, iconUrl: true } },
      targetRank: { select: { name: true, iconUrl: true } },
    },
  });

  if (!order || order.customerId !== user.id) notFound();

  const breakdown = (order.breakdown as unknown as BreakdownLine[]) ?? [];
  const alreadyPaid = order.status !== "PENDING_PAYMENT";

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr]">
      {/* Order summary */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          Checkout
        </h1>
        <p className="mt-1 text-muted-foreground">
          Order <span className="text-foreground">{order.orderNumber}</span> ·{" "}
          {order.service.title}
        </p>

        <div className="mt-8 glass rounded-3xl p-6 sm:p-8">
          {/* Progression */}
          {order.currentMmr != null && order.targetMmr != null && (
            <div className="mb-6 space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <RankMedal name={order.currentRank?.name ?? "Archon"} iconUrl={order.currentRank?.iconUrl ?? undefined} size="sm" />
                <div>
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className="font-display text-sm font-semibold text-white">
                    {order.currentRank?.name}
                    <span className="ml-1.5 font-sans text-xs font-normal text-muted-foreground">
                      {order.currentMmr.toLocaleString()} MMR
                    </span>
                  </div>
                </div>
              </div>
              <ArrowDown className="ml-3 size-4 text-gold" />
              <div className="flex items-center gap-3">
                <RankMedal name={order.targetRank?.name ?? "Ancient"} iconUrl={order.targetRank?.iconUrl ?? undefined} size="sm" />
                <div>
                  <div className="text-xs text-muted-foreground">Target</div>
                  <div className="font-display text-sm font-semibold text-white">
                    {order.targetRank?.name}
                    <span className="ml-1.5 font-sans text-xs font-normal text-muted-foreground">
                      {order.targetMmr.toLocaleString()} MMR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Breakdown */}
          <div className="space-y-2 text-sm">
            {breakdown.map((l, i) => (
              <div key={i} className="flex justify-between text-muted-foreground">
                <span>{l.label}</span>
                <span className="tabular-nums">
                  {l.amount >= 0 ? "" : "-"}
                  {formatCentavos(Math.abs(l.amount))}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-white/[0.06] pt-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Total due
              </p>
              {order.estimatedDelivery && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5 text-gold" />
                  {order.estimatedDelivery}
                </p>
              )}
            </div>
            <span className="font-display text-3xl font-bold tabular-nums text-white">
              {formatCentavos(order.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <div className="glass rounded-3xl p-6 sm:p-8">
          {alreadyPaid ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="size-12 text-emerald-400" />
              <h2 className="mt-4 font-display text-xl font-semibold text-white">
                Payment received
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This order is already paid and being processed.
              </p>
              <div className="mt-3">
                <OrderStatusBadge status={order.status} />
              </div>
              <Button asChild className="mt-6 w-full">
                <Link href={`/track-order?number=${order.orderNumber}`}>
                  Track your order
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-lg font-semibold text-white">
                Choose payment method
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your order is confirmed once payment clears.
              </p>

              <div className="mt-6 space-y-4">
                {features.stripe ? (
                  <StripeCheckoutButton orderNumber={order.orderNumber} />
                ) : (
                  <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
                    Card payments aren&apos;t configured yet. Add Stripe keys to
                    enable card checkout.
                  </p>
                )}

                {/* GCash arrives in M3 */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      GCash (manual)
                    </span>
                    <span className="text-xs text-muted-foreground">Coming soon</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Pay via GCash and upload your reference — coming in the next
                    update.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-white/[0.06] pt-5 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-gold" />
                Payments are encrypted. We never see your card details.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
