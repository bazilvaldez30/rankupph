import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { AccountShell } from "@/components/shared/account-shell";
import { OrderDetail, type OrderDetailData } from "@/components/orders/order-detail";

export const dynamic = "force-dynamic";

const INCLUDE = {
  service: { select: { title: true } },
  currentRank: { select: { name: true, iconUrl: true } },
  targetRank: { select: { name: true, iconUrl: true } },
  booster: { select: { name: true, email: true } },
  customer: { select: { name: true, email: true } },
  progressUpdates: { orderBy: { createdAt: "desc" as const } },
  credential: { select: { id: true } },
  review: { select: { id: true, isPublished: true } },
} as const;

export default async function ProviderOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageRole(["PROVIDER", "ADMIN"], "/provider");
  const { id } = await params;

  const order = (await prisma.order.findUnique({
    where: { id },
    include: INCLUDE,
  })) as OrderDetailData | null;

  // Provider may only see orders assigned to them (admins can view any).
  if (!order || (user.role !== "ADMIN" && order.boosterId !== user.id)) notFound();

  return (
    <AccountShell roleLabel="Booster" userName={user.name}>
      <Link
        href="/provider"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Workspace
      </Link>
      <div className="mt-6">
        <OrderDetail
          order={order}
          viewer="provider"
          uploadsEnabled={cloudinaryEnabled}
          canEditCredentials={false}
        />
      </div>
    </AccountShell>
  );
}
