import "server-only";
import type { NotificationType } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Persist an in-app notification. Realtime push (Pusher) is layered on in M5;
 * for now notifications are stored and read from the DB.
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body ?? null,
        link: params.link ?? null,
      },
    });
  } catch (err) {
    // Notifications are best-effort — never block the primary flow.
    console.error("[notifications] failed to create:", (err as Error).message);
    return null;
  }
}
