import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/account-queries";
import { AccountShell } from "@/components/shared/account-shell";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatCentavos, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireRole("CUSTOMER", "PROVIDER", "ADMIN");
  const orders = await getCustomerOrders(user.id);

  const active = orders.filter(
    (o) => !["CONFIRMED", "CLOSED", "CANCELLED", "REFUNDED"].includes(o.status),
  );
  const completed = orders.filter((o) =>
    ["CONFIRMED", "CLOSED"].includes(o.status),
  );

  return (
    <AccountShell roleLabel="Customer" userName={user.name}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your orders and track your climb.
          </p>
        </div>
        <Button asChild>
          <Link href="/pricing-calculator">
            New Order <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Active Orders", value: active.length },
          { label: "Completed", value: completed.length },
          { label: "Total Orders", value: orders.length },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="font-display text-3xl font-bold text-white">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-display text-lg font-semibold text-white">
        Your orders
      </h2>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <PackageOpen className="size-10 text-muted-foreground/60" />
          <p className="mt-4 font-medium text-foreground">No orders yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Start your climb — calculate a boost and place your first order in
            minutes.
          </p>
          <Button asChild className="mt-6">
            <Link href="/pricing-calculator">Start an Order</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">
                  Date
                </th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {orders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">
                    {o.orderNumber}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {o.service.title}
                  </td>
                  <td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-white">
                    {formatCentavos(o.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/track-order?number=${o.orderNumber}`}
                      className="text-gold hover:underline"
                    >
                      Track
                    </Link>
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
