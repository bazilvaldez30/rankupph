import { requireUser } from "@/lib/auth";
import { handle, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Recent notifications + unread count for the signed-in user. */
export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);
    return ok({
      unread,
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  });
}

/** Mark all as read. */
export async function POST() {
  return handle(async () => {
    const user = await requireUser();
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return ok({ success: true });
  });
}
