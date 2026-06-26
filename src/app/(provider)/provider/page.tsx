import Link from "next/link";
import { Banknote, Clock, HandHelping, Inbox, MessageSquare } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/shared/account-shell";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { ProviderOrderActions } from "@/components/provider/provider-order-actions";
import { ClaimOrderButton } from "@/components/provider/claim-order-button";
import { formatCentavos, formatDate, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const ACTIVE: string[] = ["ASSIGNED", "IN_PROGRESS"];

function avgCompletionLabel(durationsMs: number[]): string {
  if (durationsMs.length === 0) return "—";
  const avg = durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length;
  const hours = avg / 3_600_000;
  if (hours < 24) return `${Math.max(1, Math.round(hours))}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export default async function ProviderPage() {
  const user = await requirePageRole(["PROVIDER", "ADMIN"], "/provider");

  const [orders, available, recentMessages] = await Promise.all([
    prisma.order
      .findMany({
        where: { boosterId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          service: { select: { title: true } },
          currentRank: { select: { name: true } },
          targetRank: { select: { name: true } },
          customer: { select: { name: true, email: true } },
        },
      })
      .catch(() => []),
    // Open pool: paid orders nobody has claimed yet.
    prisma.order
      .findMany({
        where: { status: "PAID", boosterId: null },
        orderBy: { createdAt: "asc" },
        include: {
          service: { select: { title: true } },
          currentRank: { select: { name: true } },
          targetRank: { select: { name: true } },
        },
      })
      .catch(() => []),
    // Recent messages from customers across this booster's orders.
    prisma.chatMessage
      .findMany({
        where: {
          chat: { order: { boosterId: user.id } },
          senderId: { not: user.id },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          sender: { select: { name: true, email: true } },
          chat: { select: { order: { select: { id: true, orderNumber: true } } } },
        },
      })
      .catch(() => []),
  ]);

  const active = orders.filter((o) => ACTIVE.includes(o.status));
  const pending = orders.filter((o) => o.status === "ASSIGNED");
  const completed = orders.filter((o) =>
    ["COMPLETED", "CONFIRMED", "CLOSED"].includes(o.status),
  );

  // Earnings from confirmed work; avg completion from created→updated on closed.
  const earningsOrders = orders.filter((o) =>
    ["COMPLETED", "CONFIRMED", "CLOSED"].includes(o.status),
  );
  const earnings = earningsOrders.reduce((sum, o) => sum + o.amount, 0);
  const avgCompletion = avgCompletionLabel(
    completed.map((o) => o.updatedAt.getTime() - o.createdAt.getTime()),
  );

  return (
    <AccountShell roleLabel="Booster" userName={user.name}>
      <h1 className="font-display text-3xl font-bold text-white">Booster workspace</h1>
      <p className="mt-1 text-muted-foreground">
        Accept assigned orders, post progress, and mark them complete.
      </p>

      <div className="mb-8 mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Active Orders", value: String(active.length), icon: null },
          { label: "Pending (to accept)", value: String(pending.length), icon: null },
          { label: "Completed", value: String(completed.length), icon: null },
          { label: "Current Earnings", value: formatCentavos(earnings), icon: Banknote },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              {s.icon && <s.icon className="size-4 text-gold" />}
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Clock className="size-4 text-gold" /> Avg. completion time
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-white">{avgCompletion}</div>
          <p className="mt-1 text-xs text-muted-foreground">Across your completed orders.</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <MessageSquare className="size-4 text-gold" /> Recent messages
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentMessages.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/provider/orders/${m.chat.order.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-white/[0.03]"
                  >
                    <span className="min-w-0 truncate text-foreground/90">
                      <span className="text-muted-foreground">{m.chat.order.orderNumber}:</span>{" "}
                      {m.body || "📎 Attachment"}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDateTime(m.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Open pool — claim available paid orders */}
      {available.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <HandHelping className="size-5 text-gold" />
            Available orders
            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
              {available.length}
            </span>
          </h2>
          <div className="space-y-3">
            {available.map((o) => (
              <div
                key={o.id}
                className="flex flex-col gap-4 rounded-2xl border border-gold/15 bg-gold/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold text-white">
                    {o.orderNumber}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {o.service.title}
                    {o.currentRank && o.targetRank && (
                      <>
                        {" · "}
                        {o.currentRank.name}
                        {o.currentMmr ? ` (${o.currentMmr})` : ""} →{" "}
                        {o.targetRank.name}
                        {o.targetMmr ? ` (${o.targetMmr})` : ""}
                      </>
                    )}
                    {" · "}
                    Payout {formatCentavos(o.amount)}
                  </p>
                </div>
                <div className="shrink-0">
                  <ClaimOrderButton orderId={o.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-4 font-display text-lg font-semibold text-white">
        My orders
      </h2>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <Inbox className="size-10 text-muted-foreground/60" />
          <p className="mt-4 font-medium text-foreground">No orders yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Claim an available order above, or wait for an admin to assign you one.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/provider/orders/${o.id}`}
                      className="font-display text-lg font-semibold text-white hover:text-gold"
                    >
                      {o.orderNumber}
                    </Link>
                    <OrderStatusBadge status={o.status} />
                    <Link
                      href={`/provider/orders/${o.id}`}
                      className="text-xs text-gold hover:underline"
                    >
                      Open →
                    </Link>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {o.service.title}
                    {o.currentRank && o.targetRank && (
                      <>
                        {" · "}
                        {o.currentRank.name}
                        {o.currentMmr ? ` (${o.currentMmr})` : ""} →{" "}
                        {o.targetRank.name}
                        {o.targetMmr ? ` (${o.targetMmr})` : ""}
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed {formatDate(o.createdAt)} · Payout {formatCentavos(o.amount)}
                  </p>
                </div>
              </div>
              <div className="mt-5 border-t border-white/[0.06] pt-5">
                <ProviderOrderActions orderId={o.id} status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
