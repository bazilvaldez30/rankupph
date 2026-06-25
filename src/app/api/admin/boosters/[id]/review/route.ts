import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

const schema = z.object({ action: z.enum(["approve", "reject"]) });

/** Admin approves/rejects a booster application. Approval grants PROVIDER role. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireRole("ADMIN");
    const { id } = await params;
    const { action } = schema.parse(await req.json());

    const profile = await prisma.boosterProfile.findUnique({ where: { id } });
    if (!profile) return fail("Application not found.", 404);

    if (action === "approve") {
      await prisma.$transaction([
        prisma.boosterProfile.update({ where: { id }, data: { status: "APPROVED" } }),
        prisma.user.update({ where: { id: profile.userId }, data: { role: "PROVIDER" } }),
      ]);
      await createNotification({
        userId: profile.userId,
        type: "GENERIC",
        title: "You're approved as a booster 🎉",
        body: "Welcome aboard! You can now claim and fulfill orders.",
        link: "/provider",
      });
    } else {
      await prisma.boosterProfile.update({ where: { id }, data: { status: "REJECTED" } });
      await createNotification({
        userId: profile.userId,
        type: "GENERIC",
        title: "Booster application update",
        body: "Your booster application wasn't approved this time. You can re-apply later.",
      });
    }

    return ok({ success: true });
  });
}
