import "server-only";
import Pusher from "pusher";
import { env, features } from "./env";

/**
 * Server-side Pusher. Null when not configured — chat then persists to the DB
 * and the client falls back to polling, so realtime is purely additive.
 */
export const pusher: Pusher | null = features.pusher
  ? new Pusher({
      appId: env.pusherAppId!,
      key: env.pusherKey!,
      secret: env.pusherSecret!,
      cluster: env.pusherCluster,
      useTLS: true,
    })
  : null;

export const orderChannel = (orderId: string) => `private-order-${orderId}`;

export const CHAT_EVENTS = {
  newMessage: "message:new",
  read: "message:read",
  typing: "client-typing",
} as const;

/** Fire-and-forget trigger; no-op when Pusher is unconfigured. */
export async function triggerChat(
  orderId: string,
  event: string,
  payload: unknown,
) {
  if (!pusher) return;
  try {
    await pusher.trigger(orderChannel(orderId), event, payload);
  } catch (err) {
    console.error("[pusher] trigger failed:", (err as Error).message);
  }
}
