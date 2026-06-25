import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/shared/account-shell";
import { Badge } from "@/components/ui/badge";
import { AUDIT_ACTION_META } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const user = await requirePageRole(["ADMIN"], "/admin/audit");

  const logs = await prisma.auditLog
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { name: true, email: true, role: true } },
        order: { select: { orderNumber: true, id: true } },
      },
    })
    .catch(() => []);

  return (
    <AccountShell roleLabel="Admin" userName={user.name}>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Overview
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <ShieldCheck className="size-6 text-gold" />
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Access audit log</h1>
          <p className="text-muted-foreground">
            Every credential view/update and order milestone, with actor &amp; IP.
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center text-sm text-muted-foreground">
          No audit events yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/[0.06]">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {logs.map((log) => {
                const meta = AUDIT_ACTION_META[log.action] ?? {
                  label: log.action,
                  tone: "neutral" as const,
                };
                return (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-foreground">
                        {log.user?.name ?? log.user?.email ?? "—"}
                      </span>
                      {log.user?.role && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          ({log.user.role})
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {log.order ? (
                        <Link
                          href={`/provider/orders/${log.order.id}`}
                          className="text-gold hover:underline"
                        >
                          {log.order.orderNumber}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {log.ip ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AccountShell>
  );
}
