import Link from "next/link";
import { ArrowDown, Clock } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { CredentialsPanel } from "@/components/orders/credentials-panel";
import { OrderChat } from "@/components/chat/order-chat";
import { RankMedal } from "@/components/calculator/rank-medal";
import { medalImageForMmr, medalNameForMmr, rankLabelForMmr } from "@/lib/rank-medals";
import { ProviderOrderActions } from "@/components/provider/provider-order-actions";
import { ConfirmOrderButton } from "@/components/orders/confirm-order-button";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { Price } from "@/components/shared/price";

export type OrderDetailData = Prisma.OrderGetPayload<{
  include: {
    service: { select: { title: true } };
    currentRank: { select: { name: true; iconUrl: true } };
    targetRank: { select: { name: true; iconUrl: true } };
    booster: { select: { name: true; email: true } };
    customer: { select: { name: true; email: true } };
    progressUpdates: { orderBy: { createdAt: "desc" } };
    credential: { select: { id: true } };
  };
}>;

interface BreakdownLine {
  label: string;
  amount: number;
}

export function OrderDetail({
  order,
  viewer,
  uploadsEnabled,
  credentialsEditHref,
  canEditCredentials,
}: {
  order: OrderDetailData;
  viewer: "customer" | "provider" | "admin";
  uploadsEnabled: boolean;
  credentialsEditHref?: string;
  canEditCredentials: boolean;
}) {
  const breakdown = (order.breakdown as unknown as BreakdownLine[]) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-white">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-muted-foreground">
            {order.service.title} · Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        {viewer === "provider" && (
          <ProviderOrderActions orderId={order.id} status={order.status} />
        )}
        {viewer === "customer" && order.status === "PENDING_PAYMENT" && (
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href={`/checkout/${order.orderNumber}`}>Pay now</Link>
            </Button>
            <CancelOrderButton orderId={order.id} variant="button" />
          </div>
        )}
        {viewer === "customer" && order.status === "COMPLETED" && (
          <ConfirmOrderButton orderId={order.id} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Order info */}
          <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-white">
              Order information
            </h2>
            {order.currentMmr != null && order.targetMmr != null && (
              <div className="mb-5 space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <Medal label="Current" mmr={order.currentMmr} />
                <ArrowDown className="ml-3 size-4 text-gold" />
                <Medal label="Target" mmr={order.targetMmr} />
              </div>
            )}
            <dl className="space-y-2 text-sm">
              {breakdown.map((l, i) => (
                <div key={i} className="flex justify-between text-muted-foreground">
                  <dt>{l.label}</dt>
                  <dd className="tabular-nums">
                    {l.amount < 0 ? "-" : ""}
                    <Price centavos={Math.abs(l.amount)} />
                  </dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-white/[0.06] pt-2 text-foreground">
                <dt className="font-medium">Total</dt>
                <dd className="font-display text-lg font-bold">
                  <Price centavos={order.amount} />
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.06] pt-4 text-sm">
              {order.estimatedDelivery && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-4 text-gold" /> {order.estimatedDelivery}
                </span>
              )}
              <span className="text-muted-foreground">
                Booster:{" "}
                <span className="text-foreground">
                  {order.booster?.name ?? order.booster?.email ?? "Not assigned"}
                </span>
              </span>
              {viewer !== "customer" && (
                <span className="text-muted-foreground">
                  Customer:{" "}
                  <span className="text-foreground">
                    {order.customer.name ?? order.customer.email}
                  </span>
                </span>
              )}
            </div>
          </section>

          {/* Progress timeline */}
          <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="mb-5 font-display text-lg font-semibold text-white">
              Progress
            </h2>
            <OrderTimeline status={order.status} />
            {order.progressUpdates.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
                {order.progressUpdates.map((u) => (
                  <div key={u.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Booster update · {u.percentComplete}%</span>
                      <span>{formatDateTime(u.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/90">{u.note}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Chat */}
          <section>
            <OrderChat orderId={order.id} uploadsEnabled={uploadsEnabled} />
          </section>
        </div>

        {/* Right column — credentials */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-white">
              Account access
            </h2>
            <CredentialsPanel
              orderId={order.id}
              submitted={Boolean(order.credential)}
              canEdit={canEditCredentials}
              editHref={credentialsEditHref}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function Medal({ label, mmr }: { label: string; mmr: number }) {
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
