import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { clientIp } from "@/lib/audit";
import {
  canEditCredentials,
  credentialAccess,
  saveCredentials,
} from "@/lib/credentials";
import { credentialSchema } from "@/lib/validations/credentials";
import { isEncryptionConfigured } from "@/lib/crypto";

export const runtime = "nodejs";

/** Submit or update account access (customer before start, or admin). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const user = await requireUser();
    if (!isEncryptionConfigured()) {
      return fail("Secure storage isn't configured (missing ENCRYPTION_KEY).", 503);
    }
    const { id } = await params;
    const { kind, order } = await credentialAccess(id, user);
    if (!order || !kind) return fail("Order not found.", 404);
    if (!canEditCredentials(kind, order.status)) {
      return fail("Credentials can no longer be edited for this order.", 403);
    }

    const input = credentialSchema.parse(await req.json());
    await saveCredentials(id, input, user, clientIp(req));
    return ok({ success: true });
  });
}
