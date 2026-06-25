import "server-only";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { decrypt, encrypt, encryptNullable } from "./crypto";
import { logAudit } from "./audit";
import { normalizeBackupCodes, type CredentialInput } from "./validations/credentials";

export interface Actor {
  id: string;
  role: Role;
}

type AccessKind = "customer" | "booster" | "admin" | null;

/** Determine how (if at all) an actor may access an order's credentials. */
export async function credentialAccess(orderId: string, actor: Actor): Promise<{
  kind: AccessKind;
  order: { id: string; customerId: string; boosterId: string | null; status: string } | null;
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, customerId: true, boosterId: true, status: true },
  });
  if (!order) return { kind: null, order: null };
  if (actor.role === "ADMIN") return { kind: "admin", order };
  if (order.customerId === actor.id) return { kind: "customer", order };
  if (order.boosterId === actor.id) return { kind: "booster", order };
  return { kind: null, order };
}

/** Customers may edit only before work starts; admins always. */
export function canEditCredentials(kind: AccessKind, status: string): boolean {
  if (kind === "admin") return true;
  if (kind === "customer") {
    return ["PENDING_PAYMENT", "PAID", "ASSIGNED"].includes(status);
  }
  return false;
}

export async function saveCredentials(
  orderId: string,
  input: CredentialInput,
  actor: Actor,
  ip: string | null,
) {
  const backupCodes = normalizeBackupCodes(input.backupCodes ?? "");
  await prisma.orderCredential.upsert({
    where: { orderId },
    update: {
      steamUsername: input.steamUsername,
      steamPasswordEnc: encrypt(input.steamPassword),
      steamGuard: input.steamGuard,
      backupCodesEnc: encryptNullable(backupCodes),
      notes: input.notes?.trim() || null,
    },
    create: {
      orderId,
      steamUsername: input.steamUsername,
      steamPasswordEnc: encrypt(input.steamPassword),
      steamGuard: input.steamGuard,
      backupCodesEnc: encryptNullable(backupCodes),
      notes: input.notes?.trim() || null,
    },
  });

  await logAudit({
    userId: actor.id,
    action: "CREDENTIAL_UPDATED",
    orderId,
    ip,
    meta: { role: actor.role },
  });
}

export interface RevealedCredentials {
  steamUsername: string;
  steamPassword: string;
  steamGuard: string;
  backupCodes: string[];
  notes: string | null;
  submittedAt: string;
}

export async function revealCredentials(
  orderId: string,
  actor: Actor,
  ip: string | null,
): Promise<RevealedCredentials | null> {
  const cred = await prisma.orderCredential.findUnique({ where: { orderId } });
  if (!cred) return null;

  const backupCodes = cred.backupCodesEnc
    ? decrypt(cred.backupCodesEnc).split("\n").filter(Boolean)
    : [];

  await logAudit({
    userId: actor.id,
    action: "CREDENTIAL_VIEWED",
    orderId,
    ip,
    meta: { role: actor.role },
  });
  if (backupCodes.length > 0) {
    await logAudit({
      userId: actor.id,
      action: "BACKUP_CODES_VIEWED",
      orderId,
      ip,
      meta: { role: actor.role },
    });
  }

  return {
    steamUsername: cred.steamUsername,
    steamPassword: decrypt(cred.steamPasswordEnc),
    steamGuard: cred.steamGuard,
    backupCodes,
    notes: cred.notes,
    submittedAt: cred.submittedAt.toISOString(),
  };
}

/** Does this order already have credentials submitted? */
export async function hasCredentials(orderId: string): Promise<boolean> {
  const c = await prisma.orderCredential.findUnique({
    where: { orderId },
    select: { id: true },
  });
  return Boolean(c);
}
