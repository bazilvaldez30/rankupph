import "server-only";
import type { PaymentProvider } from "@prisma/client";
import { prisma } from "./prisma";
import { createNotification } from "./notifications";

type MarkPaidResult = "updated" | "already" | "missing";

/**
 * Idempotently mark an order as PAID and its payment SUCCEEDED, then notify the
 * customer. Shared by the Stripe webhook and the GCash approval flow (M3).
 * Returns "already" if the order was previously paid (safe to call repeatedly).
 */
export async function markOrderPaid(opts: {
  orderId: string;
  provider: PaymentProvider;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}): Promise<MarkPaidResult> {
  const order = await prisma.order.findUnique({ where: { id: opts.orderId } });
  if (!order) return "missing";

  const alreadyPaid = order.status !== "PENDING_PAYMENT";

  await prisma.$transaction(async (tx) => {
    if (!alreadyPaid) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
    }

    // Resolve the payment row to mark succeeded.
    const payment = opts.stripeSessionId
      ? await tx.payment.findFirst({ where: { stripeSessionId: opts.stripeSessionId } })
      : await tx.payment.findFirst({
          where: { orderId: order.id, provider: opts.provider },
          orderBy: { createdAt: "desc" },
        });

    if (payment) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          stripePaymentIntentId: opts.stripePaymentIntentId ?? payment.stripePaymentIntentId,
        },
      });
    }
  });

  if (alreadyPaid) return "already";

  await createNotification({
    userId: order.customerId,
    type: "PAYMENT_CONFIRMED",
    title: "Payment confirmed",
    body: `We've received payment for order ${order.orderNumber}. An admin will assign your booster shortly.`,
    link: `/track-order?number=${order.orderNumber}`,
  });

  return "updated";
}

/** Mark the most recent payment attempt for an order as failed. */
export async function markPaymentFailed(opts: {
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  reason?: string;
}) {
  const payment = opts.stripeSessionId
    ? await prisma.payment.findFirst({ where: { stripeSessionId: opts.stripeSessionId } })
    : opts.stripePaymentIntentId
      ? await prisma.payment.findFirst({
          where: { stripePaymentIntentId: opts.stripePaymentIntentId },
        })
      : null;
  if (!payment) return;
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED", failureReason: opts.reason ?? null },
  });
}
