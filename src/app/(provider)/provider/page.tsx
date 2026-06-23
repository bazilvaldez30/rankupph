import { Construction } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/shared/account-shell";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { formatCentavos, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProviderPage() {
  const user = await requireRole("PROVIDER", "ADMIN");

  const assigned = await prisma.order
    .findMany({
      where: { boosterId: user.id },
      orderBy: { createdAt: "desc" },
      include: { service: { select: { title: true } } },
    })
    .catch(() => []);

  return (
    <AccountShell roleLabel="Booster" userName={user.name}>
      <h1 className="font-display text-3xl font-bold text-white">
        Booster workspace
      </h1>
      <p className="mt-1 text-muted-foreground">
        Your assigned orders. Full progress tools arrive with the provider
        dashboard.
      </p>

      <div className="mt-8">
        {assigned.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <Construction className="size-10 text-muted-foreground/60" />
            <p className="mt-4 font-medium text-foreground">
              No orders assigned yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              When an admin assigns you an order, it will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Payout</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {assigned.map((o) => (
                  <tr key={o.id}>
                    <td className="px-5 py-4 font-medium text-white">
                      {o.orderNumber}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {o.service.title}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(o.createdAt)}
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
      </div>
    </AccountShell>
  );
}
