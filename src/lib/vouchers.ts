import "server-only";
import type { Voucher } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCentavos } from "@/lib/format";

export interface VoucherCheck {
  ok: boolean;
  voucher?: Voucher;
  discount?: number;
  error?: string;
}

/** Discount (centavos) a voucher yields on a given pre-discount subtotal. */
export function voucherDiscount(
  v: Pick<Voucher, "type" | "value">,
  subtotal: number,
): number {
  if (subtotal <= 0) return 0;
  const raw =
    v.type === "PERCENT" ? Math.round((subtotal * v.value) / 100) : v.value;
  return Math.max(0, Math.min(subtotal, raw));
}

/** Human label for a voucher's discount line on an order. */
export function voucherLabel(v: Pick<Voucher, "code" | "type" | "value">): string {
  return v.type === "PERCENT"
    ? `Voucher ${v.code} (${v.value}% off)`
    : `Voucher ${v.code}`;
}

/**
 * Validate a code against a real, server-known subtotal. Redemption limits count
 * only orders that actually progressed past payment.
 */
export async function checkVoucher(
  code: string,
  subtotal: number,
  opts: { isFirstOrder: boolean },
): Promise<VoucherCheck> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, error: "Enter a voucher code." };

  const v = await prisma.voucher.findUnique({ where: { code: normalized } });
  if (!v || !v.active) {
    return { ok: false, error: "This voucher code isn't valid." };
  }
  if (v.expiresAt && v.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "This voucher has expired." };
  }
  if (v.firstOrderOnly && !opts.isFirstOrder) {
    return { ok: false, error: "This voucher applies to first orders only." };
  }
  if (v.minSubtotal && subtotal < v.minSubtotal) {
    return {
      ok: false,
      error: `Requires a minimum order of ${formatCentavos(v.minSubtotal)}.`,
    };
  }
  if (v.maxRedemptions != null) {
    const used = await prisma.order.count({
      where: { voucherId: v.id, status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] } },
    });
    if (used >= v.maxRedemptions) {
      return { ok: false, error: "This voucher has reached its redemption limit." };
    }
  }

  const discount = voucherDiscount(v, subtotal);
  if (discount <= 0) {
    return { ok: false, error: "This voucher gives no discount on this order." };
  }
  return { ok: true, voucher: v, discount };
}
