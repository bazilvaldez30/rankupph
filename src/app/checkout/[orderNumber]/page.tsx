import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDown, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { env, features } from "@/lib/env";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { formatCentavos } from "@/lib/format";
import { Price } from "@/components/shared/price";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { RankMedal } from "@/components/calculator/rank-medal";
import { medalImageForMmr, medalNameForMmr, rankLabelForMmr } from "@/lib/rank-medals";
import { StripeCheckoutButton } from "@/components/checkout/stripe-checkout-button";
import { GCashPayment } from "@/components/checkout/gcash-payment";
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
                <RankMedal name={medalNameForMmr(order.currentMmr)} iconUrl={medalImageForMmr(order.currentMmr)} size="sm" />
                <div>
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className="font-display text-sm font-semibold text-white">
                    {rankLabelForMmr(order.currentMmr)}
                    <span className="ml-1.5 font-sans text-xs font-normal text-muted-foreground">
                      {order.currentMmr.toLocaleString()} MMR
                    </span>
                  </div>
                </div>
              </div>
              <ArrowDown className="ml-3 size-4 text-gold" />
              <div className="flex items-center gap-3">
                <RankMedal name={medalNameForMmr(order.targetMmr)} iconUrl={medalImageForMmr(order.targetMmr)} size="sm" />
                <div>
                  <div className="text-xs text-muted-foreground">Target</div>
                  <div className="font-display text-sm font-semibold text-white">
                    {rankLabelForMmr(order.targetMmr)}
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
                  <Price centavos={Math.abs(l.amount)} />
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
            <div className="text-right">
              <Price
                centavos={order.amount}
                className="font-display text-3xl font-bold tabular-nums text-white"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Charged as {formatCentavos(order.amount)} (PHP)
              </p>
            </div>
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

              <div className="mt-6 space-y-6">
                {features.stripe && (
                  <div>
                    <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                      Pay by card
                    </p>
                    <StripeCheckoutButton orderNumber={order.orderNumber} />
                  </div>
                )}

                {features.stripe && (
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/[0.07]" />
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      or
                    </span>
                    <div className="h-px flex-1 bg-white/[0.07]" />
                  </div>
                )}

                <div>
                  <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                    Pay with GCash
                  </p>
                  <GCashPayment
                    orderNumber={order.orderNumber}
                    amountLabel={formatCentavos(order.amount)}
                    gcashNumber={env.gcashNumber}
                    gcashName={env.gcashName}
                    uploadsEnabled={cloudinaryEnabled}
                  />
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
