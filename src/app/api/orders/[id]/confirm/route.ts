import { requireUser } from "@/lib/auth";
import { handle, ok } from "@/lib/api";
import { customerConfirm } from "@/lib/order-workflow";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    await customerConfirm(id, user.id);
    return ok({ success: true });
  });
}
