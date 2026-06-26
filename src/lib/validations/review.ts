import { z } from "zod";

export const REVIEW_TAGS = [
  "Fast Delivery",
  "Professional",
  "Great Communication",
  "Recommended",
  "Premium Service",
  "High Quality",
] as const;

export const reviewInputSchema = z.object({
  rating: z.number().int().min(1, "Pick a rating.").max(5),
  comment: z.string().trim().max(1000).optional().default(""),
  tags: z.array(z.enum(REVIEW_TAGS)).max(4).optional().default([]),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;
