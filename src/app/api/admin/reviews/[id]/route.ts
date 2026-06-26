import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";

export const runtime = "nodejs";

const bodySchema = z.object({ action: z.enum(["approve", "hide"]) });

/** Admin approves (publishes) or hides a customer review. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireRole("ADMIN");
    const { id } = await params;
    const { action } = bodySchema.parse(await req.json());

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return fail("Review not found.", 404);

    await prisma.review.update({
      where: { id },
      data: { isPublished: action === "approve" },
    });

    // Keep the booster's displayed rating in sync with approved reviews only.
    if (review.boosterId) {
      const agg = await prisma.review.aggregate({
        where: { boosterId: review.boosterId, isPublished: true },
        _avg: { rating: true },
      });
      await prisma.boosterProfile
        .update({
          where: { userId: review.boosterId },
          data: { rating: agg._avg.rating ?? 0 },
        })
        .catch(() => null);
    }

    return ok({ success: true });
  });
}
