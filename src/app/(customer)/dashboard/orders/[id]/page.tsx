import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { canEditCredentials, credentialAccess } from "@/lib/credentials";
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

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageRole(["CUSTOMER", "PROVIDER", "ADMIN"], "/dashboard");
  const { id } = await params;

  const order = (await prisma.order.findUnique({
    where: { id },
    include: INCLUDE,
  })) as OrderDetailData | null;

  if (!order || order.customerId !== user.id) notFound();

  const { kind } = await credentialAccess(id, user);

  return (
    <AccountShell roleLabel="Customer" userName={user.name}>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Dashboard
      </Link>
      <div className="mt-6">
        <OrderDetail
          order={order}
          viewer="customer"
          uploadsEnabled={cloudinaryEnabled}
          canEditCredentials={canEditCredentials(kind, order.status)}
          credentialsEditHref={`/orders/${order.orderNumber}/access`}
        />
      </div>
    </AccountShell>
  );
}
