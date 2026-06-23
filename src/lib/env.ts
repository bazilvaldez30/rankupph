/**
 * Centralized environment access with graceful-degradation feature flags.
 * The MVP must build & run even when optional integrations are unconfigured;
 * each `isXEnabled` flag lets callers branch to a safe fallback.
 */

function read(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

export const env = {
  appUrl: read("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",

  databaseUrl: read("DATABASE_URL"),

  authSecret: read("AUTH_SECRET"),
  googleId: read("AUTH_GOOGLE_ID"),
  googleSecret: read("AUTH_GOOGLE_SECRET"),

  stripeSecretKey: read("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: read("STRIPE_WEBHOOK_SECRET"),
  stripePublishableKey: read("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),

  pusherAppId: read("PUSHER_APP_ID"),
  pusherSecret: read("PUSHER_SECRET"),
  pusherKey: read("NEXT_PUBLIC_PUSHER_KEY"),
  pusherCluster: read("NEXT_PUBLIC_PUSHER_CLUSTER") ?? "ap1",

  cloudinaryCloudName: read("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: read("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: read("CLOUDINARY_API_SECRET"),
  cloudinaryPreset: read("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"),
} as const;

export const features = {
  googleAuth: Boolean(env.googleId && env.googleSecret),
  stripe: Boolean(env.stripeSecretKey),
  stripeWebhook: Boolean(env.stripeWebhookSecret),
  pusher: Boolean(env.pusherAppId && env.pusherSecret && env.pusherKey),
  cloudinary: Boolean(
    env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret,
  ),
} as const;
