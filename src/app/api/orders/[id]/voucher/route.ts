import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { firstOrderActive, firstOrderDiscount } from "@/lib/promo";
import { checkVoucher, voucherLabel } from "@/lib/vouchers";

export const runtime = "nodejs";

const bodySchema = z.object({ code: z.string().trim().min(1).max(40) });

interface Line {
  label: string;
  amount: number;
  kind?: string;
}

type Order = NonNullable<Awaited<ReturnType<typeof prisma.order.findUnique>>>;

async function loadOrder(
  id: string,
  userId: string,
): Promise<{ error: Response } | { order: Order }> {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return { error: fail("Order not found.", 404) };
  if (order.customerId !== userId)
    return { error: fail("This isn't your order.", 403) };
  if (order.status !== "PENDING_PAYMENT")
    return { error: fail("This order can no longer be changed.", 409) };
  return { order };
}

/** Is this order the customer's genuine first order? */
async function isFirstOrder(customerId: string, orderId: string) {
  const earliest = await prisma.order.findFirst({
    where: { customerId, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return earliest?.id === orderId;
}

function itemLines(breakdown: unknown): Line[] {
  return ((breakdown as Line[]) ?? []).filter((l) => l.kind !== "discount");
}

/** Apply a voucher code to a pending order. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { code } = bodySchema.parse(await req.json());

    const res = await loadOrder(id, user.id);
    if ("error" in res) return res.error;
    const { order } = res;

    const firstOrder = await isFirstOrder(order.customerId, order.id);
    const check = await checkVoucher(code, order.subtotal, {
      isFirstOrder: firstOrder,
    });
    if (!check.ok || !check.voucher || check.discount == null) {
      return fail(check.error ?? "Invalid voucher.", 422);
    }

    // Vouchers don't stack with the welcome discount — the larger applies.
    const welcome =
      firstOrderActive() && firstOrder ? firstOrderDiscount(order.subtotal) : 0;
    if (check.discount < welcome) {
      return fail(
        "Your welcome discount already saves more than this voucher.",
        409,
      );
    }

    const items = itemLines(order.breakdown);
    const breakdown: Line[] = [
      ...items,
      { label: voucherLabel(check.voucher), amount: -check.discount, kind: "discount" },
    ];

    await prisma.order.update({
      where: { id: order.id },
      data: {
        voucherId: check.voucher.id,
        amount: Math.max(0, order.subtotal - check.discount),
        breakdown: breakdown as object[],
      },
    });

    return ok({
      applied: true,
      code: check.voucher.code,
      discount: check.discount,
      subtotal: order.subtotal,
      total: Math.max(0, order.subtotal - check.discount),
    });
  });
}

/** Remove an applied voucher, restoring the automatic welcome discount. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;

    const res = await loadOrder(id, user.id);
    if ("error" in res) return res.error;
    const { order } = res;

    const firstOrder = await isFirstOrder(order.customerId, order.id);
    const welcome =
      firstOrderActive() && firstOrder ? firstOrderDiscount(order.subtotal) : 0;

    const items = itemLines(order.breakdown);
    const breakdown: Line[] = [...items];
    if (welcome > 0) {
      breakdown.push({
        label: `First-order discount (${Math.round((welcome / order.subtotal) * 100)}%)`,
        amount: -welcome,
        kind: "discount",
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        voucherId: null,
        amount: Math.max(0, order.subtotal - welcome),
        breakdown: breakdown as object[],
      },
    });

    return ok({ removed: true, total: Math.max(0, order.subtotal - welcome) });
  });
}
