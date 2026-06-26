/**
 * Conversion / promotion config. Pure & client-safe (no DB imports).
 *
 * The first-order discount is REAL — it is applied server-side at order
 * creation only when the customer is genuinely placing their first order
 * (see getFirstOrderOffer in promo.server.ts). Never display a discount a
 * visitor won't actually receive.
 */

export const FIRST_ORDER = {
  enabled: true,
  /** Percentage off the first order. */
  percent: 25,
  /**
   * Optional ISO end date. When set (and in the future), a subtle
   * "limited-time" badge is shown. Leave null for an always-on welcome offer.
   */
  endsAt: "2026-07-26T23:59:59.000Z" as string | null,
  code: "WELCOME25",
} as const;

/**
 * Referral program config (future-ready). Backend wiring (codes + credit
 * ledger) lands later; `comingSoon` drives the teaser UI today.
 */
export const REFERRAL = {
  enabled: false,
  comingSoon: true,
  /** Credit (PHP) each side receives after the referee's first completed order. */
  creditPhp: 200,
} as const;

export function firstOrderActive(now: number = Date.now()): boolean {
  if (!FIRST_ORDER.enabled) return false;
  if (FIRST_ORDER.endsAt) return new Date(FIRST_ORDER.endsAt).getTime() > now;
  return true;
}

/** Discount amount (centavos) for a given pre-discount total. */
export function firstOrderDiscount(totalCentavos: number): number {
  if (!firstOrderActive() || totalCentavos <= 0) return 0;
  return Math.round((totalCentavos * FIRST_ORDER.percent) / 100);
}

export interface FirstOrderOffer {
  /** Promotion is enabled and within its window. */
  active: boolean;
  /** This visitor would actually receive it on their next (first) order. */
  eligible: boolean;
  percent: number;
  endsAt: string | null;
}

/** Default offer for client components before/without a server value. */
export const DEFAULT_OFFER: FirstOrderOffer = {
  active: firstOrderActive(),
  eligible: firstOrderActive(),
  percent: FIRST_ORDER.percent,
  endsAt: FIRST_ORDER.endsAt,
};

/**
 * Concise, honest trust signals shown near checkout actions.
 * These are statements of fact about the service — not statistics.
 */
export const TRUST_SIGNALS = [
  "Secure encrypted payment",
  "Stripe & GCash supported",
  "Live order tracking",
  "Verified professional boosters",
  "24/7 customer support",
] as const;

/**
 * Ethical FOMO signals. Each may carry a real `value` (e.g. a count pulled
 * from the DB). When `value` is null the metric is simply omitted — we never
 * fabricate numbers. `template` formats a provided real value.
 */
export interface FomoSignal {
  key: string;
  icon: "shield" | "star" | "bolt" | "users" | "rocket";
  /** Static, always-true label (no numbers). */
  label: string;
  /** Optional real value (count, hours, etc.); null hides the numeric variant. */
  value?: string | number | null;
  /** Formats the real value into a full message. */
  template?: (v: string | number) => string;
}

/**
 * Build the FOMO signal list from REAL data. Pass values you can prove
 * (e.g. published review count). Anything left undefined falls back to a
 * factual, number-free statement.
 */
export function buildFomoSignals(data?: {
  customers?: number | null;
  rating?: number | null;
}): FomoSignal[] {
  const signals: FomoSignal[] = [];

  if (data?.customers && data.customers > 0) {
    signals.push({
      key: "customers",
      icon: "star",
      label: "Trusted by satisfied players",
      value: data.customers,
      template: (v) => `Join ${Number(v).toLocaleString()}+ satisfied players`,
    });
  } else {
    signals.push({
      key: "customers",
      icon: "star",
      label: "Trusted by players worldwide",
    });
  }

  if (data?.rating && data.rating > 0) {
    signals.push({
      key: "rating",
      icon: "shield",
      label: "Verified, highly-rated service",
      value: data.rating,
      template: (v) => `${Number(v).toFixed(1)}★ from verified orders`,
    });
  }

  signals.push({
    key: "verified",
    icon: "shield",
    label: "Verified professional boosters",
  });
  signals.push({
    key: "secure",
    icon: "bolt",
    label: "Secure Stripe & GCash payments",
  });

  return signals;
}
