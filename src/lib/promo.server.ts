import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { FIRST_ORDER, firstOrderActive, type FirstOrderOffer } from "@/lib/promo";

/**
 * True when this user has never placed an order (their next order is genuinely
 * their first). Cancelled orders don't count against eligibility.
 */
export async function isFirstOrderEligible(userId: string): Promise<boolean> {
  try {
    const prior = await prisma.order.count({
      where: { customerId: userId, status: { not: "CANCELLED" } },
    });
    return prior === 0;
  } catch {
    // On a DB hiccup, fail closed (no discount) — never over-promise.
    return false;
  }
}

/**
 * Resolve the first-order offer for the current visitor. Anonymous visitors are
 * treated as eligible (they'd qualify on sign-up); signed-in customers are
 * checked against their real order history.
 */
export async function getFirstOrderOffer(): Promise<FirstOrderOffer> {
  const active = firstOrderActive();
  const base: FirstOrderOffer = {
    active,
    eligible: active,
    percent: FIRST_ORDER.percent,
    endsAt: FIRST_ORDER.endsAt,
  };
  if (!active) return base;

  const user = await getCurrentUser().catch(() => null);
  if (!user) return base; // anonymous → eligible
  if (user.role !== "CUSTOMER") return { ...base, eligible: false };

  return { ...base, eligible: await isFirstOrderEligible(user.id) };
}
