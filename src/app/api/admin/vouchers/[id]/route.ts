import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";

export const runtime = "nodejs";

const bodySchema = z.object({ active: z.boolean() });

/** Activate / deactivate a voucher (admin only). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireRole("ADMIN");
    const { id } = await params;
    const { active } = bodySchema.parse(await req.json());

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) return fail("Voucher not found.", 404);

    await prisma.voucher.update({ where: { id }, data: { active } });
    return ok({ success: true });
  });
}
