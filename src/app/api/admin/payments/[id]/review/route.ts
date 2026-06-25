import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { markOrderPaid } from "@/lib/payments";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

const bodySchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(500).optional(),
});

/** Admin approves or rejects a submitted GCash payment. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const admin = await requireRole("ADMIN");
    const { id } = await params;
    const { action, reason } = bodySchema.parse(await req.json());

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: { select: { id: true, orderNumber: true, customerId: true } } },
    });
    if (!payment) return fail("Payment not found.", 404);
    if (payment.provider !== "GCASH") return fail("Not a GCash payment.", 422);
    if (payment.status !== "PENDING") return fail("This payment was already reviewed.", 409);

    if (action === "approve") {
      await prisma.payment.update({
        where: { id },
        data: { status: "SUCCEEDED", reviewedById: admin.id },
      });
      // Flip the order to PAID (idempotent) + notify the customer.
      await markOrderPaid({ orderId: payment.order.id, provider: "GCASH" });
    } else {
      await prisma.payment.update({
        where: { id },
        data: { status: "REJECTED", reviewedById: admin.id, failureReason: reason ?? null },
      });
      await createNotification({
        userId: payment.order.customerId,
        type: "GENERIC",
        title: "GCash payment needs attention",
        body: `Your GCash payment for ${payment.order.orderNumber} couldn't be verified${
          reason ? `: ${reason}` : ""
        }. Please re-submit or contact support.`,
        link: `/checkout/${payment.order.orderNumber}`,
      });
    }

    return ok({ success: true });
  });
}
