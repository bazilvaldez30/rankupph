import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

const bodySchema = z.object({
  orderNumber: z.string().min(1),
  reference: z.string().trim().min(3, "Enter the GCash reference number.").max(60),
  screenshotUrl: z.string().url().optional(),
});

/** Customer submits a GCash payment for manual admin verification. */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser();
    const { orderNumber, reference, screenshotUrl } = bodySchema.parse(await req.json());

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.toUpperCase() },
    });
    if (!order) return fail("Order not found.", 404);
    if (order.customerId !== user.id) return fail("This isn't your order.", 403);
    if (order.status !== "PENDING_PAYMENT") {
      return fail("This order is no longer awaiting payment.", 409);
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "GCASH",
        status: "PENDING",
        amount: order.amount,
        currency: "PHP",
        gcashReference: reference,
        gcashScreenshotUrl: screenshotUrl ?? null,
      },
    });

    // Notify admins that a GCash payment needs review.
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    await Promise.all(
      admins.map((a) =>
        createNotification({
          userId: a.id,
          type: "GCASH_SUBMITTED",
          title: "GCash payment to review",
          body: `Order ${order.orderNumber} submitted a GCash payment (ref ${reference}).`,
          link: "/admin/payments",
        }),
      ),
    );

    return ok({ success: true }, { status: 201 });
  });
}
