import Stripe from "stripe";
import { env, features } from "./env";

/**
 * Stripe client. Null when STRIPE_SECRET_KEY is absent so the app builds and
 * runs without Stripe configured — callers branch on `null` and degrade
 * gracefully (card checkout simply disabled).
 */
export const stripe: Stripe | null = features.stripe
  ? new Stripe(env.stripeSecretKey!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
      appInfo: { name: "RankUpPH" },
    })
  : null;
