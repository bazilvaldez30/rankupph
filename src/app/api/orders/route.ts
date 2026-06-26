import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { computeQuoteForSlug } from "@/lib/pricing-service";
import { rankFromMmr } from "@/lib/pricing";
import { createOrderSchema } from "@/lib/validations/order";
import { generateOrderNumber } from "@/lib/ids";
import { FIRST_ORDER, firstOrderDiscount } from "@/lib/promo";
import { isFirstOrderEligible } from "@/lib/promo.server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser();
    if (user.role !== "CUSTOMER") {
      return fail(
        "Only customer accounts can place orders. Booster and admin accounts can't check out.",
        403,
      );
    }
    const input = createOrderSchema.parse(await req.json());

    // Authoritative server-side quote — the client price is never trusted.
    const quote = await computeQuoteForSlug({
      serviceSlug: input.serviceSlug,
      currentMmr: input.currentMmr,
      targetMmr: input.targetMmr,
      quantity: input.quantity,
      optionSelections: input.optionSelections,
      modifierKeys: input.modifierKeys,
    });
    if (!quote.valid) {
      return fail(quote.error ?? "Invalid order configuration.", 422);
    }

    const game = await prisma.game.findFirst({ where: { slug: "dota-2" } });
    if (!game) return fail("Game catalog is not configured.", 503);

    const service = await prisma.service.findFirst({
      where: { gameId: game.id, slug: input.serviceSlug, isActive: true },
    });
    if (!service) return fail("Selected service is unavailable.", 404);

    if (service.pricingMethod === "MMR_RANGE" && (input.currentMmr == null || input.targetMmr == null)) {
      return fail("Current and target MMR are required.", 422);
    }

    // Resolve medal bands from MMR for display/context.
    const ranks = await prisma.rank.findMany({
      where: { gameId: game.id },
      orderBy: { order: "asc" },
    });
    const currentRankId =
      input.currentMmr != null ? (rankFromMmr(ranks, input.currentMmr)?.id ?? null) : null;
    const targetRankId =
      input.targetMmr != null ? (rankFromMmr(ranks, input.targetMmr)?.id ?? null) : null;

    // Real first-order discount — only when this is genuinely the customer's
    // first order. Computed server-side; the charged amount reflects it.
    const eligible = await isFirstOrderEligible(user.id);
    const discount = eligible ? firstOrderDiscount(quote.total) : 0;
    const chargedAmount = Math.max(0, quote.total - discount);
    const breakdownLines = [
      ...quote.breakdown,
      ...quote.optionsApplied,
      ...quote.modifiersApplied,
    ] as object[];
    if (discount > 0) {
      breakdownLines.push({
        label: `First-order discount (${FIRST_ORDER.percent}%)`,
        amount: -discount,
        kind: "discount",
      });
    }

    let order;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        order = await prisma.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            gameId: game.id,
            serviceId: service.id,
            customerId: user.id,
            status: "PENDING_PAYMENT",
            currentRankId,
            targetRankId,
            currentMmr: input.currentMmr ?? null,
            targetMmr: input.targetMmr ?? null,
            quantity: input.quantity ?? null,
            modifiers: input.modifierKeys,
            options: input.optionSelections,
            breakdown: breakdownLines,
            subtotal: quote.total,
            amount: chargedAmount,
            currency: "PHP",
            estimatedDelivery: quote.estimatedDelivery,
            customerNotes: input.customerNotes ?? null,
          },
          select: { id: true, orderNumber: true, status: true, amount: true },
        });
        break;
      } catch (err) {
        if (attempt === 2) throw err;
      }
    }

    return ok({ order }, { status: 201 });
  });
}
