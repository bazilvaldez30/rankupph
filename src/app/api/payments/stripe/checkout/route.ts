import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const bodySchema = z.object({ orderNumber: z.string().min(1) });

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser();

    if (!stripe) {
      return fail("Card payments are not configured yet. Please use GCash.", 503);
    }

    const { orderNumber } = bodySchema.parse(await req.json());

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.toUpperCase() },
      include: { service: { select: { title: true } } },
    });
    if (!order) return fail("Order not found.", 404);
    if (order.customerId !== user.id) return fail("This isn't your order.", 403);
    if (order.status !== "PENDING_PAYMENT") {
      return fail("This order is no longer awaiting payment.", 409);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // PHP amounts are already integer centavos — Stripe's smallest unit.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "php",
            unit_amount: order.amount,
            product_data: {
              name: `${order.service.title} — ${order.orderNumber}`,
              description: "RankUpPH Dota 2 service",
            },
          },
        },
      ],
      client_reference_id: order.id,
      customer_email: user.email ?? undefined,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      payment_intent_data: {
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
      },
      success_url: `${env.appUrl}/track-order?number=${order.orderNumber}&status=success`,
      cancel_url: `${env.appUrl}/checkout/${order.orderNumber}?status=cancelled`,
    });

    // Record the payment attempt (authoritative status set by the webhook).
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "STRIPE",
        status: "PROCESSING",
        amount: order.amount,
        currency: "PHP",
        stripeSessionId: session.id,
      },
    });

    return ok({ url: session.url });
  });
}
