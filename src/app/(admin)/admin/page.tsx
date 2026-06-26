import Link from "next/link";
import { ArrowRight, Banknote, Clock, Package, TrendingUp } from "lucide-react";
import { Prisma } from "@prisma/client";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/shared/account-shell";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatCentavos, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type RecentOrder = Prisma.OrderGetPayload<{
  include: {
    service: { select: { title: true } };
    customer: { select: { name: true; email: true } };
  };
}>;

async function loadStats() {
  try {
    const [paidAgg, activeCount, awaitingAssignment, completedCount, recent] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { amount: true },
          where: {
            status: {
              in: ["PAID", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CONFIRMED", "CLOSED"],
            },
          },
        }),
        prisma.order.count({
          where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
        }),
        prisma.order.count({ where: { status: "PAID", boosterId: null } }),
        prisma.order.count({ where: { status: { in: ["CONFIRMED", "CLOSED"] } } }),
        prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 8,
          include: {
            service: { select: { title: true } },
            customer: { select: { name: true, email: true } },
          },
        }),
      ]);
    return {
      revenue: paidAgg._sum.amount ?? 0,
      activeCount,
      awaitingAssignment,
      completedCount,
      recent,
    };
  } catch {
    return {
      revenue: 0,
      activeCount: 0,
      awaitingAssignment: 0,
      completedCount: 0,
      recent: [] as RecentOrder[],
    };
  }
}

export default async function AdminPage() {
  const user = await requirePageRole(["ADMIN"], "/admin");
  const stats = await loadStats();

  const cards = [
    {
      label: "Revenue",
      value: formatCentavos(stats.revenue),
      icon: Banknote,
    },
    { label: "Active Orders", value: String(stats.activeCount), icon: TrendingUp },
    { label: "Awaiting Assignment", value: String(stats.awaitingAssignment), icon: Clock },
    { label: "Completed", value: String(stats.completedCount), icon: Package },
  ];

  return (
    <AccountShell roleLabel="Admin" userName={user.name}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Admin overview
          </h1>
          <p className="mt-1 text-muted-foreground">
            Revenue and order health at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/payments">Payments</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/boosters">Boosters</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/reviews">Reviews</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/pricing">Pricing</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/audit">Audit log</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/orders">
              Manage orders <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {c.label}
              </span>
              <c.icon className="size-4 text-gold" />
            </div>
            <div className="mt-3 font-display text-2xl font-bold text-white">
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {stats.awaitingAssignment > 0 && (
        <Link
          href="/admin/orders"
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-gold/25 bg-gold/[0.05] px-5 py-4 transition-colors hover:bg-gold/[0.08]"
        >
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-gold" />
            <div>
              <p className="text-sm font-medium text-white">
                {stats.awaitingAssignment} paid order
                {stats.awaitingAssignment > 1 ? "s" : ""} awaiting a booster
              </p>
              <p className="text-xs text-muted-foreground">
                Assign a booster to get these started.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-gold">
            Assign now <ArrowRight className="size-4" />
          </span>
        </Link>
      )}

      <h2 className="mb-4 mt-10 font-display text-lg font-semibold text-white">
        Recent orders
      </h2>
      {stats.recent.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center text-sm text-muted-foreground">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">
                  Customer
                </th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {stats.recent.map((o) => (
                <tr key={o.id}>
                  <td className="px-5 py-4 font-medium text-white">
                    {o.orderNumber}
                  </td>
                  <td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">
                    {o.customer.name ?? o.customer.email}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {o.service.title}
                  </td>
                  <td className="px-5 py-4 text-white">
                    {formatCentavos(o.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AccountShell>
  );
}
