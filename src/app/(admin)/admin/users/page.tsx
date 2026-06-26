import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AccountShell } from "@/components/shared/account-shell";
import { Badge } from "@/components/ui/badge";
import { UserRoleActions } from "@/components/admin/user-role-actions";

export const dynamic = "force-dynamic";

const ROLE_TONE = {
  ADMIN: "gold",
  PROVIDER: "success",
  CUSTOMER: "neutral",
} as const;

const ROLE_LABEL = {
  ADMIN: "Admin",
  PROVIDER: "Booster",
  CUSTOMER: "Customer",
} as const;

export default async function AdminUsersPage() {
  const admin = await requirePageRole(["ADMIN"], "/admin/users");

  const users = await prisma.user
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
    .catch(() => []);

  const counts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <AccountShell roleLabel="Admin" userName={admin.name}>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Overview
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Users</h1>
      <p className="mt-1 text-muted-foreground">
        Manage accounts — promote a customer to booster, or revert a booster back
        to a customer.
      </p>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-muted-foreground">
          {counts.CUSTOMER ?? 0} customers
        </span>
        <span className="rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1 text-gold">
          {counts.PROVIDER ?? 0} boosters
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-muted-foreground">
          {counts.ADMIN ?? 0} admins
        </span>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-5 py-4">
                  <div className="font-medium text-white">{u.name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-5 py-4">
                  <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <UserRoleActions userId={u.id} role={u.role} />
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AccountShell>
  );
}
