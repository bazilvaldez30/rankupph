import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { reviewInputSchema } from "@/lib/validations/review";

export const runtime = "nodejs";

/**
 * Submit a verified customer review for a completed order. Only the order's
 * customer may review, only once, and only after the order is confirmed/closed.
 * The review is marked `isVerified` (verified purchase) and starts unpublished —
 * an admin approves it before it appears publicly or in structured data.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    const input = reviewInputSchema.parse(await req.json());

    const order = await prisma.order.findUnique({
      where: { id },
      include: { review: { select: { id: true } } },
    });
    if (!order) return fail("Order not found.", 404);
    if (order.customerId !== user.id) return fail("This isn't your order.", 403);
    if (!["COMPLETED", "CONFIRMED", "CLOSED"].includes(order.status)) {
      return fail("You can review an order once it's completed.", 409);
    }
    if (order.review) return fail("You've already reviewed this order.", 409);

    await prisma.review.create({
      data: {
        orderId: order.id,
        customerId: user.id,
        serviceId: order.serviceId,
        boosterId: order.boosterId,
        rating: input.rating,
        comment: input.comment?.trim() || null,
        tags: input.tags ?? [],
        isVerified: true, // tied to a real completed purchase
        isPublished: false, // awaits admin approval
      },
    });

    return ok({ success: true }, { status: 201 });
  });
}
