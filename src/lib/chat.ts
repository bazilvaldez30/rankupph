import "server-only";
import type { ChatRole, Role } from "@prisma/client";
import { prisma } from "./prisma";

export interface Actor {
  id: string;
  role: Role;
}

type AccessKind = "customer" | "booster" | "admin" | null;

export async function chatAccess(orderId: string, actor: Actor): Promise<{
  kind: AccessKind;
  order: { id: string; customerId: string; boosterId: string | null } | null;
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, customerId: true, boosterId: true },
  });
  if (!order) return { kind: null, order: null };
  if (actor.role === "ADMIN") return { kind: "admin", order };
  if (order.customerId === actor.id) return { kind: "customer", order };
  if (order.boosterId === actor.id) return { kind: "booster", order };
  return { kind: null, order };
}

const toChatRole = (kind: AccessKind): ChatRole =>
  kind === "admin" ? "ADMIN" : kind === "booster" ? "BOOSTER" : "CUSTOMER";

/** Ensure the order has a chat and that the actor is a participant. */
export async function ensureChatForActor(orderId: string, actor: Actor, kind: AccessKind) {
  const chat = await prisma.orderChat.upsert({
    where: { orderId },
    update: {},
    create: { orderId },
  });
  await prisma.chatParticipant.upsert({
    where: { chatId_userId: { chatId: chat.id, userId: actor.id } },
    update: {},
    create: { chatId: chat.id, userId: actor.id, role: toChatRole(kind) },
  });
  return chat;
}

export interface SerializedMessage {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  createdAt: string;
  attachments: { id: string; url: string; width: number | null; height: number | null }[];
}

export async function listMessages(chatId: string): Promise<SerializedMessage[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: {
      sender: { select: { name: true, email: true, role: true } },
      attachments: { select: { id: true, url: true, width: true, height: true } },
    },
  });
  return rows.map((m) => ({
    id: m.id,
    body: m.body,
    senderId: m.senderId,
    senderName: m.sender.name ?? m.sender.email,
    senderRole: m.sender.role,
    createdAt: m.createdAt.toISOString(),
    attachments: m.attachments,
  }));
}

export async function sendMessage(params: {
  chatId: string;
  senderId: string;
  body: string;
  attachments?: { url: string; publicId?: string; mimeType?: string; width?: number; height?: number; bytes?: number }[];
}): Promise<SerializedMessage> {
  const message = await prisma.chatMessage.create({
    data: {
      chatId: params.chatId,
      senderId: params.senderId,
      body: params.body,
      attachments: params.attachments?.length
        ? { create: params.attachments }
        : undefined,
    },
    include: {
      sender: { select: { name: true, email: true, role: true } },
      attachments: { select: { id: true, url: true, width: true, height: true } },
    },
  });
  await prisma.orderChat.update({ where: { id: params.chatId }, data: { updatedAt: new Date() } });
  // The sender has implicitly read their own message.
  await prisma.chatParticipant.updateMany({
    where: { chatId: params.chatId, userId: params.senderId },
    data: { lastReadAt: new Date() },
  });
  return {
    id: message.id,
    body: message.body,
    senderId: message.senderId,
    senderName: message.sender.name ?? message.sender.email,
    senderRole: message.sender.role,
    createdAt: message.createdAt.toISOString(),
    attachments: message.attachments,
  };
}

export async function markRead(chatId: string, userId: string) {
  await prisma.chatParticipant.updateMany({
    where: { chatId, userId },
    data: { lastReadAt: new Date() },
  });
}

/** Unread count for a user across an order's chat. */
export async function unreadCountForOrder(orderId: string, userId: string): Promise<number> {
  const chat = await prisma.orderChat.findUnique({ where: { orderId }, select: { id: true } });
  if (!chat) return 0;
  const participant = await prisma.chatParticipant.findUnique({
    where: { chatId_userId: { chatId: chat.id, userId } },
    select: { lastReadAt: true },
  });
  return prisma.chatMessage.count({
    where: {
      chatId: chat.id,
      senderId: { not: userId },
      ...(participant?.lastReadAt ? { createdAt: { gt: participant.lastReadAt } } : {}),
    },
  });
}

/** Latest read timestamp of the *other* participants (for "seen" receipts). */
export async function othersLastReadAt(chatId: string, userId: string): Promise<string | null> {
  const others = await prisma.chatParticipant.findMany({
    where: { chatId, userId: { not: userId }, lastReadAt: { not: null } },
    select: { lastReadAt: true },
    orderBy: { lastReadAt: "desc" },
    take: 1,
  });
  return others[0]?.lastReadAt?.toISOString() ?? null;
}
