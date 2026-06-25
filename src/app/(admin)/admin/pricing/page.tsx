import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/shared/account-shell";
import { PricingEditor } from "@/components/admin/pricing-editor";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const user = await requirePageRole(["ADMIN"], "/admin/pricing");

  const game = await prisma.game.findFirst({ where: { slug: "dota-2" } });
  const [ranks, modifiers] = await Promise.all([
    prisma.rank.findMany({
      where: game ? { gameId: game.id } : undefined,
      orderBy: { order: "asc" },
      select: { id: true, name: true, minMmr: true, maxMmr: true, pricePer100: true },
    }),
    prisma.pricingModifier.findMany({
      where: game ? { gameId: game.id } : undefined,
      orderBy: { sortOrder: "asc" },
      select: { id: true, label: true, kind: true, value: true, isActive: true },
    }),
  ]);

  return (
    <AccountShell roleLabel="Admin" userName={user.name}>
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Overview
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Pricing</h1>
      <p className="mt-1 text-muted-foreground">
        All pricing is stored in the database — edit it here and the calculator
        updates instantly. No code changes, no hardcoded values.
      </p>

      <div className="mt-8">
        <PricingEditor
          ranks={ranks}
          modifiers={modifiers.map((m) => ({
            id: m.id,
            label: m.label,
            kind: m.kind,
            value: m.value,
            isActive: m.isActive,
          }))}
        />
      </div>
    </AccountShell>
  );
}
