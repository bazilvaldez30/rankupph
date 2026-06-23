import { z } from "zod";

const mmr = z.number().int().min(0).max(12000);

export const quoteSchema = z.object({
  serviceSlug: z.string().min(1),
  currentMmr: mmr.optional(),
  targetMmr: mmr.optional(),
  quantity: z.number().int().min(1).max(100).optional(),
  optionSelections: z.record(z.string(), z.string()).default({}),
  modifierKeys: z.array(z.string()).max(12).default([]),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
