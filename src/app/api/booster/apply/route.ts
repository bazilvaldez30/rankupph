import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

const schema = z.object({
  displayName: z.string().trim().min(2, "Enter a display name.").max(60),
  rankAchieved: z.string().trim().min(2, "Enter your peak rank.").max(120),
  bio: z.string().trim().max(1000).optional(),
});

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser();
    const input = schema.parse(await req.json());

    const existing = await prisma.boosterProfile.findUnique({
      where: { userId: user.id },
    });
    if (existing && existing.status !== "REJECTED") {
      return fail(
        existing.status === "APPROVED"
          ? "You're already an approved booster."
          : "Your application is already under review.",
        409,
      );
    }

    await prisma.boosterProfile.upsert({
      where: { userId: user.id },
      update: {
        status: "PENDING",
        displayName: input.displayName,
        rankAchieved: input.rankAchieved,
        bio: input.bio ?? null,
      },
      create: {
        userId: user.id,
        status: "PENDING",
        displayName: input.displayName,
        rankAchieved: input.rankAchieved,
        bio: input.bio ?? null,
      },
    });

    // Notify admins.
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await Promise.all(
      admins.map((a) =>
        createNotification({
          userId: a.id,
          type: "GENERIC",
          title: "New booster application",
          body: `${input.displayName} (${input.rankAchieved}) applied to become a booster.`,
          link: "/admin/boosters",
        }),
      ),
    );

    return ok({ success: true }, { status: 201 });
  });
}
