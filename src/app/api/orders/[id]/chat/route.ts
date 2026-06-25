import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import {
  chatAccess,
  ensureChatForActor,
  listMessages,
  markRead,
  othersLastReadAt,
  sendMessage,
} from "@/lib/chat";
import { CHAT_EVENTS, triggerChat } from "@/lib/pusher";

export const runtime = "nodejs";

const sendSchema = z.object({
  body: z.string().trim().max(4000).default(""),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().optional(),
        mimeType: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        bytes: z.number().optional(),
      }),
    )
    .max(6)
    .optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { kind, order } = await chatAccess(id, user);
    if (!order) return fail("Order not found.", 404);
    if (!kind) return fail("You don't have access to this chat.", 403);

    const chat = await ensureChatForActor(id, user, kind);
    await markRead(chat.id, user.id);
    const [messages, seenAt] = await Promise.all([
      listMessages(chat.id),
      othersLastReadAt(chat.id, user.id),
    ]);

    return ok({
      messages,
      seenAt,
      me: { id: user.id, role: user.role },
    });
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { kind, order } = await chatAccess(id, user);
    if (!order) return fail("Order not found.", 404);
    if (!kind) return fail("You don't have access to this chat.", 403);

    const input = sendSchema.parse(await req.json());
    if (!input.body && !(input.attachments && input.attachments.length)) {
      return fail("Message is empty.", 422);
    }

    const chat = await ensureChatForActor(id, user, kind);
    const message = await sendMessage({
      chatId: chat.id,
      senderId: user.id,
      body: input.body,
      attachments: input.attachments,
    });

    await triggerChat(id, CHAT_EVENTS.newMessage, message);
    return ok({ message }, { status: 201 });
  });
}
