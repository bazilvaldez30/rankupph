import "server-only";
import type { AuditAction } from "@prisma/client";
import { prisma } from "./prisma";

/** Best-effort client IP from proxy headers (Vercel/Next). */
export function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

/**
 * Append to the audit trail. Best-effort — never blocks the primary action.
 * Records who did what, when, from where (IP), with optional metadata.
 */
export async function logAudit(params: {
  userId?: string | null;
  action: AuditAction;
  orderId?: string | null;
  ip?: string | null;
  meta?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        orderId: params.orderId ?? null,
        ip: params.ip ?? null,
        meta: params.meta ? (params.meta as object) : undefined,
      },
    });
  } catch (err) {
    console.error("[audit] failed:", (err as Error).message);
  }
}
