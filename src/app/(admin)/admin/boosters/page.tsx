import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/shared/account-shell";
import { Badge } from "@/components/ui/badge";
import { BoosterReviewActions } from "@/components/admin/booster-review-actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
} as const;

export default async function AdminBoostersPage() {
  const user = await requirePageRole(["ADMIN"], "/admin/boosters");

  const profiles = await prisma.boosterProfile
    .findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { user: { select: { name: true, email: true } } },
    })
    .catch(() => []);

  const pending = profiles.filter((p) => p.status === "PENDING");
  const others = profiles.filter((p) => p.status !== "PENDING");

  return (
    <AccountShell roleLabel="Admin" userName={user.name}>
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Overview
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Boosters</h1>
      <p className="mt-1 text-muted-foreground">
        Review applications and manage your verified booster roster.
      </p>

      <h2 className="mb-4 mt-8 flex items-center gap-2 font-display text-lg font-semibold text-white">
        Pending applications
        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
          {pending.length}
        </span>
      </h2>
      {pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-muted-foreground">
          No applications awaiting review.
        </p>
      ) : (
        <div className="space-y-4">
          {pending.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-4 rounded-2xl border border-gold/15 bg-gold/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-display text-base font-semibold text-white">
                  {p.displayName ?? p.user.name ?? p.user.email}
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  {p.rankAchieved} · {p.user.email}
                </div>
                {p.bio && <p className="mt-2 max-w-xl text-sm text-foreground/80">{p.bio}</p>}
                <p className="mt-1 text-xs text-muted-foreground">Applied {formatDate(p.createdAt)}</p>
              </div>
              <BoosterReviewActions profileId={p.id} />
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-4 mt-10 font-display text-lg font-semibold text-white">Roster</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Booster</th>
              <th className="px-5 py-3 font-medium">Rank</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium">Completed</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {others.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3">
                  <div className="font-medium text-white">{p.displayName ?? p.user.name ?? p.user.email}</div>
                  <div className="text-xs text-muted-foreground">{p.user.email}</div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{p.rankAchieved ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1 text-foreground">
                    <Star className="size-3.5 fill-gold text-gold" /> {p.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-5 py-3 text-white">{p.completedOrders}</td>
                <td className="px-5 py-3">
                  <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                </td>
              </tr>
            ))}
            {others.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No boosters yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AccountShell>
  );
}
