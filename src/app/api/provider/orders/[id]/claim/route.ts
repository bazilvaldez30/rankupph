import { requireRole } from "@/lib/auth";
import { handle, ok } from "@/lib/api";
import { claimOrder } from "@/lib/order-workflow";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireRole("PROVIDER");
    const { id } = await params;
    await claimOrder(id, user.id);
    return ok({ success: true });
  });
}
