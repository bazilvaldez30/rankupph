import { requireUser } from "@/lib/auth";
import { pusher } from "@/lib/pusher";
import { chatAccess } from "@/lib/chat";

export const runtime = "nodejs";

/** Authorizes private order channels — only chat participants may subscribe. */
export async function POST(req: Request) {
  if (!pusher) return new Response("Pusher not configured.", { status: 503 });

  const user = await requireUser().catch(() => null);
  if (!user) return new Response("Unauthorized.", { status: 401 });

  const form = new URLSearchParams(await req.text());
  const socketId = form.get("socket_id");
  const channel = form.get("channel_name");
  if (!socketId || !channel) return new Response("Bad request.", { status: 400 });

  // Channel shape: private-order-{orderId}
  const orderId = channel.replace(/^private-order-/, "");
  if (orderId === channel) return new Response("Forbidden.", { status: 403 });

  const { kind } = await chatAccess(orderId, user);
  if (!kind) return new Response("Forbidden.", { status: 403 });

  const auth = pusher.authorizeChannel(socketId, channel);
  return Response.json(auth);
}
