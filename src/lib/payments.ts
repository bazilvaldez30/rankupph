import "server-only";
import type { PaymentProvider } from "@prisma/client";
import { prisma } from "./prisma";
import { createNotification } from "./notifications";
import { stripe } from "./stripe";

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

/**
 * Verify a Stripe Checkout Session directly with Stripe and mark its order paid
 * if the session is paid. Used as a return-page safety net so payments confirm
 * even when the webhook is delayed or (in local dev) not running. Idempotent.
 */
export async function reconcileStripeSession(
  sessionId: string,
): Promise<MarkPaidResult | "skip"> {
  if (!stripe) return "skip";
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return "skip";
    const orderId = session.metadata?.orderId;
    if (!orderId) return "skip";
    return await markOrderPaid({
      orderId,
      provider: "STRIPE",
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? undefined),
    });
  } catch (err) {
    console.error("[stripe] reconcile failed:", (err as Error).message);
    return "skip";
  }
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
