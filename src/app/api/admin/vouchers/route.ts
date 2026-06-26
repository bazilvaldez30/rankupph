import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";

export const runtime = "nodejs";

const createSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - or _ only."),
    description: z.string().trim().max(120).optional(),
    type: z.enum(["PERCENT", "FIXED"]),
    /** PERCENT: whole percent 1–100. FIXED: PHP amount (converted to centavos). */
    value: z.number().positive(),
    active: z.boolean().default(true),
    firstOrderOnly: z.boolean().default(false),
    minSubtotalPhp: z.number().min(0).optional(),
    maxRedemptions: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional().nullable(),
  })
  .refine((v) => v.type !== "PERCENT" || (v.value >= 1 && v.value <= 100), {
    message: "Percent must be between 1 and 100.",
    path: ["value"],
  });

/** Create a voucher (admin only). */
export async function POST(req: Request) {
  return handle(async () => {
    const admin = await requireRole("ADMIN");
    const input = createSchema.parse(await req.json());

    const code = input.code.toUpperCase();
    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (existing) return fail("A voucher with that code already exists.", 409);

    const value =
      input.type === "FIXED" ? Math.round(input.value * 100) : Math.round(input.value);

    const voucher = await prisma.voucher.create({
      data: {
        code,
        description: input.description || null,
        type: input.type,
        value,
        active: input.active,
        firstOrderOnly: input.firstOrderOnly,
        minSubtotal:
          input.minSubtotalPhp != null && input.minSubtotalPhp > 0
            ? Math.round(input.minSubtotalPhp * 100)
            : null,
        maxRedemptions: input.maxRedemptions ?? null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        createdById: admin.id,
      },
      select: { id: true, code: true },
    });

    return ok({ voucher }, { status: 201 });
  });
}
