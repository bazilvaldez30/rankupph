import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handle, ok } from "@/lib/api";
import { addProgress, boosterAccept, boosterComplete } from "@/lib/order-workflow";

export const runtime = "nodejs";

const bodySchema = z.object({
  action: z.enum(["accept", "progress", "complete"]),
  note: z.string().max(1000).optional(),
  percentComplete: z.number().int().min(0).max(100).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireRole("PROVIDER", "ADMIN");
    const { id } = await params;
    const body = bodySchema.parse(await req.json());

    if (body.action === "accept") {
      await boosterAccept(id, user.id);
    } else if (body.action === "progress") {
      if (!body.note) throw new Error("A note is required for a progress update.");
      await addProgress(id, user.id, body.note, body.percentComplete ?? 0);
    } else {
      await boosterComplete(id, user.id, body.note);
    }

    return ok({ success: true });
  });
}
