import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handle, ok } from "@/lib/api";
import { assignBooster } from "@/lib/order-workflow";

export const runtime = "nodejs";

const bodySchema = z.object({ boosterId: z.string().min(1) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const admin = await requireRole("ADMIN");
    const { id } = await params;
    const { boosterId } = bodySchema.parse(await req.json());
    await assignBooster(id, boosterId, admin.id);
    return ok({ success: true });
  });
}
