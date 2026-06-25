import "server-only";
import { prisma } from "./prisma";
import { createNotification } from "./notifications";
import { logAudit } from "./audit";

/**
 * Order lifecycle transitions. Each enforces the valid source state + actor,
 * updates the order, records progress, and notifies the relevant parties.
 *
 * Flow: PAID → ASSIGNED → IN_PROGRESS → COMPLETED → CONFIRMED → CLOSED
 */

export class WorkflowError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
  }
}

/** Admin assigns (or reassigns) a booster to a paid order. */
export async function assignBooster(orderId: string, boosterId: string, actorId?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new WorkflowError(404, "Order not found.");
  if (!["PAID", "ASSIGNED"].includes(order.status)) {
    throw new WorkflowError(409, "Only paid orders can be assigned.");
  }

  const booster = await prisma.user.findFirst({
    where: { id: boosterId, role: "PROVIDER" },
    include: { boosterProfile: true },
  });
  if (!booster || booster.boosterProfile?.status !== "APPROVED") {
    throw new WorkflowError(422, "Booster must be an approved provider.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { boosterId, status: "ASSIGNED" },
  });

  await logAudit({
    userId: actorId ?? null,
    action: "BOOSTER_ASSIGNED",
    orderId,
    meta: { boosterId },
  });

  await Promise.all([
    createNotification({
      userId: boosterId,
      type: "BOOSTER_ASSIGNED",
      title: "New order assigned",
      body: `Order ${order.orderNumber} has been assigned to you.`,
      link: `/provider/orders/${order.id}`,
    }),
    createNotification({
      userId: order.customerId,
      type: "BOOSTER_ASSIGNED",
      title: "Booster assigned",
      body: `A verified booster is now handling order ${order.orderNumber}.`,
      link: `/track-order?number=${order.orderNumber}`,
    }),
  ]);
}

/** Booster claims an available (paid, unassigned) order → ASSIGNED to them. */
export async function claimOrder(orderId: string, boosterId: string) {
  const booster = await prisma.user.findFirst({
    where: { id: boosterId, role: "PROVIDER" },
    include: { boosterProfile: true },
  });
  if (!booster || booster.boosterProfile?.status !== "APPROVED") {
    throw new WorkflowError(403, "Only approved boosters can claim orders.");
  }

  // Atomic claim: only succeeds if still PAID and unassigned (prevents races).
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: "PAID", boosterId: null },
    data: { boosterId, status: "ASSIGNED" },
  });
  if (result.count === 0) {
    throw new WorkflowError(409, "This order was just taken or isn't available.");
  }

  await logAudit({ userId: boosterId, action: "BOOSTER_ASSIGNED", orderId, meta: { claimed: true } });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (order) {
    await createNotification({
      userId: order.customerId,
      type: "BOOSTER_ASSIGNED",
      title: "Booster assigned",
      body: `A verified booster picked up order ${order.orderNumber}.`,
      link: `/track-order?number=${order.orderNumber}`,
    });
  }
}

/** Booster accepts the assignment → IN_PROGRESS. */
export async function boosterAccept(orderId: string, boosterId: string) {
  const order = await requireBoosterOrder(orderId, boosterId);
  if (order.status !== "ASSIGNED") {
    throw new WorkflowError(409, "Order is not awaiting acceptance.");
  }
  await prisma.order.update({ where: { id: orderId }, data: { status: "IN_PROGRESS" } });
  await logAudit({ userId: boosterId, action: "ORDER_STARTED", orderId });
  await createNotification({
    userId: order.customerId,
    type: "PROGRESS_UPDATED",
    title: "Your boost has started",
    body: `Work on order ${order.orderNumber} is now in progress.`,
    link: `/track-order?number=${order.orderNumber}`,
  });
}

/** Booster posts a progress update. */
export async function addProgress(
  orderId: string,
  boosterId: string,
  note: string,
  percentComplete: number,
) {
  const order = await requireBoosterOrder(orderId, boosterId);
  if (!["ASSIGNED", "IN_PROGRESS"].includes(order.status)) {
    throw new WorkflowError(409, "Order is not active.");
  }
  await prisma.$transaction([
    prisma.orderProgressUpdate.create({
      data: { orderId, boosterId, note, percentComplete: clampPercent(percentComplete) },
    }),
    ...(order.status === "ASSIGNED"
      ? [prisma.order.update({ where: { id: orderId }, data: { status: "IN_PROGRESS" } })]
      : []),
  ]);
  await createNotification({
    userId: order.customerId,
    type: "PROGRESS_UPDATED",
    title: "Progress update",
    body: note,
    link: `/track-order?number=${order.orderNumber}`,
  });
}

/** Booster marks the order completed → COMPLETED (awaits customer confirmation). */
export async function boosterComplete(orderId: string, boosterId: string, note?: string) {
  const order = await requireBoosterOrder(orderId, boosterId);
  if (!["IN_PROGRESS", "ASSIGNED"].includes(order.status)) {
    throw new WorkflowError(409, "Order cannot be completed from its current state.");
  }
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "COMPLETED" } }),
    prisma.orderProgressUpdate.create({
      data: {
        orderId,
        boosterId,
        note: note?.trim() || "Order marked as completed. Please review and confirm.",
        percentComplete: 100,
      },
    }),
  ]);
  await createNotification({
    userId: order.customerId,
    type: "ORDER_COMPLETED",
    title: "Order completed 🎉",
    body: `Order ${order.orderNumber} is done. Please confirm to close it.`,
    link: `/track-order?number=${order.orderNumber}`,
  });
}

/** Customer cancels an unpaid order → CANCELLED. */
export async function cancelOrder(orderId: string, customerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new WorkflowError(404, "Order not found.");
  if (order.customerId !== customerId) throw new WorkflowError(403, "Not your order.");
  if (order.status !== "PENDING_PAYMENT") {
    throw new WorkflowError(409, "Only orders awaiting payment can be cancelled.");
  }
  await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
}

/** Customer confirms completion → CONFIRMED, then CLOSED; booster stats bump. */
export async function customerConfirm(orderId: string, customerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new WorkflowError(404, "Order not found.");
  if (order.customerId !== customerId) throw new WorkflowError(403, "Not your order.");
  if (order.status !== "COMPLETED") {
    throw new WorkflowError(409, "Order isn't ready to confirm.");
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: "CLOSED" } });
  if (order.boosterId) {
    await prisma.boosterProfile
      .update({
        where: { userId: order.boosterId },
        data: { completedOrders: { increment: 1 } },
      })
      .catch(() => null);
    await createNotification({
      userId: order.boosterId,
      type: "ORDER_CONFIRMED",
      title: "Order confirmed",
      body: `The customer confirmed order ${order.orderNumber}. Nice work!`,
    });
  }
}

// ── helpers ──────────────────────────────────────────────────

async function requireBoosterOrder(orderId: string, boosterId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new WorkflowError(404, "Order not found.");
  if (order.boosterId !== boosterId) throw new WorkflowError(403, "Not assigned to you.");
  return order;
}

function clampPercent(n: number) {
  return Math.min(100, Math.max(0, Math.round(n)));
}
