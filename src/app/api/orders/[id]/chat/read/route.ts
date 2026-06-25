import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { chatAccess, ensureChatForActor, markRead } from "@/lib/chat";
import { CHAT_EVENTS, triggerChat } from "@/lib/pusher";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { kind, order } = await chatAccess(id, user);
    if (!order) return fail("Order not found.", 404);
    if (!kind) return fail("No access.", 403);

    const chat = await ensureChatForActor(id, user, kind);
    await markRead(chat.id, user.id);
    await triggerChat(id, CHAT_EVENTS.read, { userId: user.id, at: new Date().toISOString() });
    return ok({ success: true });
  });
}
