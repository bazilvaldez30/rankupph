import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { markOrderPaid, markPaymentFailed } from "@/lib/payments";

export const runtime = "nodejs";
// Never cache; must read the raw body for signature verification.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!stripe || !env.stripeWebhookSecret) {
    return new Response("Stripe webhook not configured.", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature.", { status: 400 });

  // Raw body is required — do NOT parse JSON first.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch (err) {
    console.error("[stripe] signature verification failed:", (err as Error).message);
    return new Response("Invalid signature.", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId && session.payment_status === "paid") {
          await markOrderPaid({
            orderId,
            provider: "STRIPE",
            stripeSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : (session.payment_intent?.id ?? undefined),
          });
        }
        break;
      }

      // Redundant safety net — confirms payment even if the session event is missed.
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          await markOrderPaid({
            orderId,
            provider: "STRIPE",
            stripePaymentIntentId: pi.id,
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        await markPaymentFailed({
          stripePaymentIntentId: pi.id,
          reason: pi.last_payment_error?.message,
        });
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error("[stripe] handler error:", (err as Error).message);
    // 500 → Stripe retries later (the handler is idempotent).
    return new Response("Handler error.", { status: 500 });
  }

  return Response.json({ received: true });
}
