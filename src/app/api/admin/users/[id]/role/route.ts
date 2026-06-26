import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

const schema = z.object({ role: z.enum(["CUSTOMER", "PROVIDER"]) });

/**
 * Admin promotes a user to booster (PROVIDER) or reverts a booster to customer.
 * Promotion also marks their booster profile APPROVED so they become assignable;
 * reversion blocks if the booster still has active orders.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const admin = await requireRole("ADMIN");
    const { id } = await params;
    const { role } = schema.parse(await req.json());

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, name: true },
    });
    if (!target) return fail("User not found.", 404);
    if (target.id === admin.id) return fail("You can't change your own role.", 409);
    if (target.role === "ADMIN") return fail("Admin accounts can't be changed here.", 409);
    if (target.role === role) return fail("User already has that role.", 409);

    if (role === "PROVIDER") {
      await prisma.$transaction([
        prisma.user.update({ where: { id }, data: { role: "PROVIDER" } }),
        prisma.boosterProfile.upsert({
          where: { userId: id },
          update: { status: "APPROVED" },
          create: { userId: id, status: "APPROVED", displayName: target.name ?? null },
        }),
      ]);
      await createNotification({
        userId: id,
        type: "GENERIC",
        title: "You're now a booster 🎉",
        body: "An admin granted you booster access. You can now claim and fulfill orders.",
        link: "/provider",
      }).catch(() => null);
    } else {
      // Reverting to customer — don't orphan in-flight work.
      const active = await prisma.order.count({
        where: { boosterId: id, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
      });
      if (active > 0) {
        return fail(
          `This booster has ${active} active order${active > 1 ? "s" : ""}. Reassign them before reverting.`,
          409,
        );
      }
      await prisma.$transaction([
        prisma.user.update({ where: { id }, data: { role: "CUSTOMER" } }),
        prisma.boosterProfile.updateMany({
          where: { userId: id },
          data: { status: "REJECTED" },
        }),
      ]);
      await createNotification({
        userId: id,
        type: "GENERIC",
        title: "Booster access removed",
        body: "Your account is now a standard customer account.",
      }).catch(() => null);
    }

    return ok({ success: true, role });
  });
}
