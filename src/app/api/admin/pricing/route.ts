import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { handle, ok } from "@/lib/api";

export const runtime = "nodejs";

const schema = z.object({
  ranks: z
    .array(z.object({ id: z.string(), pricePer100: z.number().int().min(0).max(1_000_000) }))
    .max(20),
  modifiers: z
    .array(
      z.object({
        id: z.string(),
        value: z.number().int().min(0).max(10_000_000),
        isActive: z.boolean().optional(),
      }),
    )
    .max(20),
});

/** Admin updates MMR-band per-100 rates and modifier values (all DB-driven). */
export async function POST(req: Request) {
  return handle(async () => {
    await requireRole("ADMIN");
    const { ranks, modifiers } = schema.parse(await req.json());

    await prisma.$transaction([
      ...ranks.map((r) =>
        prisma.rank.update({ where: { id: r.id }, data: { pricePer100: r.pricePer100 } }),
      ),
      ...modifiers.map((m) =>
        prisma.pricingModifier.update({
          where: { id: m.id },
          data: { value: m.value, ...(m.isActive !== undefined ? { isActive: m.isActive } : {}) },
        }),
      ),
    ]);

    return ok({ success: true });
  });
}
