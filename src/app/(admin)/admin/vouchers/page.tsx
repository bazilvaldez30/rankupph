import Link from "next/link";
import { ArrowLeft, Ticket } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCentavos, formatDate } from "@/lib/format";
import { AccountShell } from "@/components/shared/account-shell";
import { Badge } from "@/components/ui/badge";
import { VoucherCreateForm } from "@/components/admin/voucher-create-form";
import { VoucherToggle } from "@/components/admin/voucher-toggle";

export const dynamic = "force-dynamic";

export default async function AdminVouchersPage() {
  const user = await requirePageRole(["ADMIN"], "/admin/vouchers");

  const vouchers = await prisma.voucher
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        _count: {
          select: {
            orders: { where: { status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] } } },
          },
        },
      },
    })
    .catch(() => []);

  return (
    <AccountShell roleLabel="Admin" userName={user.name}>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Overview
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Vouchers</h1>
      <p className="mt-1 text-muted-foreground">
        Generate discount codes — percentage or fixed amount. Customers apply them
        at checkout; the discount is validated and applied server-side.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.3fr]">
        <VoucherCreateForm />

        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-white">
            All vouchers
          </h2>
          {vouchers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center text-sm text-muted-foreground">
              No vouchers yet. Create one on the left.
            </p>
          ) : (
            <div className="space-y-3">
              {vouchers.map((v) => {
                const expired = v.expiresAt && v.expiresAt.getTime() < Date.now();
                return (
                  <div
                    key={v.id}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 items-center justify-center rounded-lg border border-gold/20 bg-gold/[0.06] text-gold">
                            <Ticket className="size-4" />
                          </span>
                          <span className="font-display text-lg font-bold tracking-wide text-white">
                            {v.code}
                          </span>
                          <Badge tone={v.active && !expired ? "success" : "neutral"}>
                            {expired ? "Expired" : v.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-foreground/90">
                          {v.type === "PERCENT"
                            ? `${v.value}% off`
                            : `${formatCentavos(v.value)} off`}
                          {v.firstOrderOnly && " · first order only"}
                          {v.minSubtotal
                            ? ` · min ${formatCentavos(v.minSubtotal)}`
                            : ""}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {v._count.orders}
                          {v.maxRedemptions ? ` / ${v.maxRedemptions}` : ""} redeemed
                          {v.expiresAt && ` · expires ${formatDate(v.expiresAt)}`}
                          {v.description && ` · ${v.description}`}
                        </p>
                      </div>
                      <VoucherToggle voucherId={v.id} active={v.active} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AccountShell>
  );
}
