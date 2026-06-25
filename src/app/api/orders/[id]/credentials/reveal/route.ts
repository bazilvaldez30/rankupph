import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { clientIp } from "@/lib/audit";
import { credentialAccess, revealCredentials } from "@/lib/credentials";

export const runtime = "nodejs";

/**
 * Reveal decrypted credentials. Allowed for the order's customer, its assigned
 * booster, or an admin only — and every reveal is written to the audit log.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { kind, order } = await credentialAccess(id, user);
    if (!order) return fail("Order not found.", 404);
    if (!kind) return fail("You don't have access to these credentials.", 403);

    const revealed = await revealCredentials(id, user, clientIp(req));
    if (!revealed) return fail("No credentials submitted for this order yet.", 404);
    return ok(revealed);
  });
}
