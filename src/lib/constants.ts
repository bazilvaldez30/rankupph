import type { OrderStatus, PaymentStatus } from "@prisma/client";
import type { ServiceCategoryKey } from "./catalog-data";

export const SITE = {
  name: "RankUpPH",
  legalName: "RankUpPH Boosting Services",
  tagline: "Reach Your Desired Rank Faster.",
  description:
    "Premium Dota 2 boosting, duo queue, calibration, ranked wins, and coaching for players worldwide. Global coverage across all major Dota 2 regions. Secure payments via Stripe and GCash. Trusted by competitive players worldwide.",
  domain: "rankupph.com",
  twitter: "@rankupph",
  supportEmail: "support@rankupph.com",
} as const;

export const SERVICE_CATEGORY_META: Record<
  ServiceCategoryKey,
  { label: string; tagline: string }
> = {
  MMR_BOOSTING: {
    label: "MMR Boosting",
    tagline: "Climb to your desired rank with a verified pro — solo or duo.",
  },
  CALIBRATION: {
    label: "Calibration",
    tagline: "Maximize your seasonal calibration with pro-played matches.",
  },
  RANKED_WINS: {
    label: "Ranked Wins",
    tagline: "Buy a guaranteed number of ranked wins on your account.",
  },
  BATTLE_CUP: {
    label: "Battle Cup",
    tagline: "Take home the weekly Battle Cup trophy at any division.",
  },
  LOW_PRIORITY: {
    label: "Low Priority",
    tagline: "Clear low-priority games fast and get back to ranked.",
  },
  COACHING: {
    label: "Coaching",
    tagline: "1-on-1 sessions with Immortal coaches. Fix mistakes, climb solo.",
  },
};

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }
> = {
  PENDING_PAYMENT: { label: "Awaiting Payment", tone: "warning" },
  PAID: { label: "Paid", tone: "info" },
  ASSIGNED: { label: "Booster Assigned", tone: "info" },
  IN_PROGRESS: { label: "In Progress", tone: "info" },
  COMPLETED: { label: "Awaiting Confirmation", tone: "warning" },
  CONFIRMED: { label: "Completed", tone: "success" },
  CLOSED: { label: "Completed", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  REFUNDED: { label: "Refunded", tone: "danger" },
};

/** Ordered customer-facing timeline stages used in the tracking UI. */
export const ORDER_TIMELINE: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CONFIRMED",
];

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }
> = {
  PENDING: { label: "Pending", tone: "warning" },
  PROCESSING: { label: "Processing", tone: "info" },
  SUCCEEDED: { label: "Succeeded", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  REJECTED: { label: "Rejected", tone: "danger" },
};

export const AUDIT_ACTION_META: Record<
  string,
  { label: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }
> = {
  CREDENTIAL_VIEWED: { label: "Credential viewed", tone: "warning" },
  CREDENTIAL_UPDATED: { label: "Credential updated", tone: "info" },
  BACKUP_CODES_VIEWED: { label: "Backup codes viewed", tone: "danger" },
  BOOSTER_ASSIGNED: { label: "Booster assigned", tone: "info" },
  ORDER_STARTED: { label: "Order started", tone: "success" },
};

export const MODIFIER_KEYS = {
  DUO_QUEUE: "DUO_QUEUE",
  PRIORITY: "PRIORITY",
  ROLE_PREF: "ROLE_PREF",
  STREAM: "STREAM",
} as const;
