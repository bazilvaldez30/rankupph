import { prisma } from "@/lib/prisma";
import { fail, handle, ok } from "@/lib/api";

export const runtime = "nodejs";

/**
 * Public order lookup by order number. Returns only non-sensitive fields so
 * customers can track status without signing in.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  return handle(async () => {
    const { orderNumber } = await params;
    const normalized = orderNumber.trim().toUpperCase();

    const order = await prisma.order.findUnique({
      where: { orderNumber: normalized },
      include: {
        service: { select: { title: true, category: true } },
        currentRank: { select: { name: true } },
        targetRank: { select: { name: true } },
        booster: { select: { name: true } },
        progressUpdates: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { note: true, percentComplete: true, createdAt: true },
        },
      },
    });

    if (!order) return fail("Order not found. Check your order number.", 404);

    return ok({
      orderNumber: order.orderNumber,
      status: order.status,
      service: order.service,
      currentRank: order.currentRank?.name ?? null,
      currentStar: order.currentStar,
      targetRank: order.targetRank?.name ?? null,
      targetStar: order.targetStar,
      amount: order.amount,
      currency: order.currency,
      boosterName: order.booster?.name ?? null,
      latestProgress: order.progressUpdates[0]?.percentComplete ?? 0,
      progressUpdates: order.progressUpdates,
      createdAt: order.createdAt,
    });
  });
}
