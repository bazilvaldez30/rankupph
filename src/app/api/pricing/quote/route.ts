import { handle, ok } from "@/lib/api";
import { computeQuoteForSlug } from "@/lib/pricing-service";
import { quoteSchema } from "@/lib/validations/pricing";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handle(async () => {
    const input = quoteSchema.parse(await req.json());
    const quote = await computeQuoteForSlug(input);
    return ok(quote);
  });
}
