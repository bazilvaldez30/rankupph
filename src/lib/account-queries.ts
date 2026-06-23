import "server-only";
import { prisma } from "./prisma";

export async function getCustomerOrders(userId: string) {
  return prisma.order.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { title: true } },
      currentRank: { select: { name: true } },
      targetRank: { select: { name: true } },
    },
  });
}

export type CustomerOrder = Awaited<
  ReturnType<typeof getCustomerOrders>
>[number];
