import { requireUser } from "@/lib/auth";
import { fail, handle, ok } from "@/lib/api";
import { cloudinaryEnabled, uploadImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(req: Request) {
  return handle(async () => {
    await requireUser();
    if (!cloudinaryEnabled) {
      return fail("Image uploads aren't configured.", 503);
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("No file provided.", 422);
    if (!ALLOWED.includes(file.type)) return fail("Only image files are allowed.", 422);
    if (file.size > MAX_BYTES) return fail("Image must be under 8MB.", 422);

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer);
    if (!result) return fail("Upload failed.", 502);
    return ok(result);
  });
}
