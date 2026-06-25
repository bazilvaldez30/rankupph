import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reconcileStripeSession } from "@/lib/payments";
import { AccountAccessForm } from "@/components/orders/account-access-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submit Account Access",
  robots: { index: false, follow: false },
};

export default async function AccountAccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ session_id?: string; status?: string }>;
}) {
  const { orderNumber } = await params;
  const { session_id } = await searchParams;
  const normalized = orderNumber.toUpperCase();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/orders/${normalized}/access`);

  // Returning from Stripe: confirm the payment directly (safety net for a
  // delayed/absent webhook) so the order is marked PAID immediately.
  if (session_id) await reconcileStripeSession(session_id);

  const order = await prisma.order.findUnique({
    where: { orderNumber: normalized },
    include: { service: { select: { title: true } }, credential: true },
  });
  if (!order || order.customerId !== user.id) notFound();

  const modifiers = (order.modifiers as unknown as string[]) ?? [];
  const isDuo = modifiers.includes("DUO_QUEUE");
  const trackHref = `/track-order?number=${order.orderNumber}`;

  // Duo queue keeps the player on their own account — no credentials needed.
  if (isDuo) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <ShieldCheck className="mx-auto size-12 text-gold" />
        <h1 className="mt-5 font-display text-2xl font-bold text-white">
          No account access needed
        </h1>
        <p className="mt-3 text-muted-foreground">
          You picked <span className="text-foreground">Duo Queue</span> — you keep
          full control of your account and play alongside your booster. Nothing to
          share.
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link href={trackHref}>Track your order</Link>
        </Button>
      </div>
    );
  }

  const alreadySubmitted = Boolean(order.credential);

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs font-medium text-emerald-300">
          <CheckCircle2 className="size-3.5" /> Payment received
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-white">
          Submit account access
        </h1>
        <p className="mt-2 text-muted-foreground">
          Order <span className="text-foreground">{order.orderNumber}</span> ·{" "}
          {order.service.title}. Provide your Steam access so a booster can begin
          once assigned.
        </p>
      </div>

      <div className="glass rounded-3xl p-6 sm:p-8">
        <AccountAccessForm
          orderId={order.id}
          redirectTo={trackHref}
          submitLabel={alreadySubmitted ? "Update Account Access" : "Submit Account Access"}
          defaults={
            order.credential
              ? {
                  steamUsername: order.credential.steamUsername,
                  steamGuard: order.credential.steamGuard,
                  notes: order.credential.notes ?? "",
                }
              : undefined
          }
        />
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Prefer to do this later?{" "}
        <Link href={trackHref} className="text-gold hover:underline">
          Skip for now
        </Link>{" "}
        — you can submit it from your order page anytime before work starts.
      </p>
    </div>
  );
}
