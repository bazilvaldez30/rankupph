import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/shared/account-shell";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { PaymentReviewActions } from "@/components/admin/payment-review-actions";
import { formatCentavos, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const user = await requirePageRole(["ADMIN"], "/admin/payments");

  const [pendingGcash, recent] = await Promise.all([
    prisma.payment.findMany({
      where: { provider: "GCASH", status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { order: { select: { orderNumber: true, customer: { select: { name: true, email: true } } } } },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { order: { select: { orderNumber: true } } },
    }),
  ]);

  return (
    <AccountShell roleLabel="Admin" userName={user.name}>
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Overview
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold text-white">Payments</h1>
      <p className="mt-1 text-muted-foreground">
        Verify GCash payments and review all transactions.
      </p>

      {/* GCash queue */}
      <h2 className="mb-4 mt-8 flex items-center gap-2 font-display text-lg font-semibold text-white">
        GCash awaiting verification
        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
          {pendingGcash.length}
        </span>
      </h2>

      {pendingGcash.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-muted-foreground">
          No GCash payments to review.
        </p>
      ) : (
        <div className="space-y-4">
          {pendingGcash.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-4 rounded-2xl border border-gold/15 bg-gold/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                {p.gcashScreenshotUrl ? (
                  <a href={p.gcashScreenshotUrl} target="_blank" rel="noreferrer">
                    <Image
                      src={p.gcashScreenshotUrl}
                      alt="GCash receipt"
                      width={72}
                      height={72}
                      className="size-16 rounded-lg object-cover"
                    />
                  </a>
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-lg border border-white/10 text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                <div>
                  <div className="font-display text-base font-semibold text-white">
                    {p.order.orderNumber} · {formatCentavos(p.amount)}
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {p.order.customer.name ?? p.order.customer.email}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Ref: <span className="font-mono text-foreground">{p.gcashReference}</span> ·{" "}
                    {formatDateTime(p.createdAt)}
                  </div>
                </div>
              </div>
              <PaymentReviewActions paymentId={p.id} />
            </div>
          ))}
        </div>
      )}

      {/* All recent */}
      <h2 className="mb-4 mt-10 font-display text-lg font-semibold text-white">
        Recent transactions
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {recent.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3 font-medium text-white">{p.order.orderNumber}</td>
                <td className="px-5 py-3">
                  <Badge tone="neutral">{p.provider}</Badge>
                </td>
                <td className="px-5 py-3 text-white">{formatCentavos(p.amount)}</td>
                <td className="px-5 py-3">
                  <PaymentStatusBadge status={p.status} />
                </td>
                <td className="px-5 py-3 text-muted-foreground">{formatDateTime(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountShell>
  );
}
