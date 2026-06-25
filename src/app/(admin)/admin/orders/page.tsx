import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/shared/account-shell";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { AssignBooster } from "@/components/admin/assign-booster";
import { formatCentavos, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await requirePageRole(["ADMIN"], "/admin/orders");

  const [orders, boosters] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        service: { select: { title: true } },
        customer: { select: { name: true, email: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "PROVIDER", boosterProfile: { status: "APPROVED" } },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const boosterOptions = boosters.map((b) => ({
    id: b.id,
    label: b.name ?? b.email,
  }));

  return (
    <AccountShell roleLabel="Admin" userName={user.name}>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Overview
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold text-white">Manage orders</h1>
      <p className="mt-1 text-muted-foreground">
        Assign approved boosters to paid orders and track every order&apos;s status.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center text-sm text-muted-foreground">
          No orders yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/[0.06]">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Booster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{o.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {o.customer.name ?? o.customer.email}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{o.service.title}</td>
                  <td className="px-5 py-4 text-white">{formatCentavos(o.amount)}</td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-4">
                    <AssignBooster
                      orderId={o.id}
                      boosters={boosterOptions}
                      currentBoosterId={o.boosterId}
                      assignable={["PAID", "ASSIGNED"].includes(o.status)}
                    />
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
