/**
 * Multi-currency display. PHP is the single source of truth — every `amount`
 * in the DB is PHP centavos. For international visitors we show *estimates* in
 * USD/EUR; the actual charge (Stripe/GCash) is always PHP.
 *
 * Rates are approximate and intentionally static (estimates, not a forex feed).
 * Tune them here — `phpPerUnit` = how many PHP equal 1 unit of that currency.
 */

export type CurrencyCode = "PHP" | "USD" | "EUR";

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  label: string;
  /** PHP per 1 unit of this currency. */
  phpPerUnit: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  PHP: { code: "PHP", symbol: "₱", label: "PHP", phpPerUnit: 1 },
  USD: { code: "USD", symbol: "$", label: "USD", phpPerUnit: 58 },
  EUR: { code: "EUR", symbol: "€", label: "EUR", phpPerUnit: 65 },
};

export const CURRENCY_CODES: CurrencyCode[] = ["PHP", "USD", "EUR"];

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === "string" && v in CURRENCIES;
}

/**
 * Format PHP centavos for display in the chosen currency.
 * PHP shows the exact peso amount; USD/EUR show an "≈" converted estimate.
 */
export function formatPrice(phpCentavos: number, code: CurrencyCode): string {
  const php = phpCentavos / 100;
  if (code === "PHP") {
    return `₱${Math.round(php).toLocaleString("en-PH")}`;
  }
  const meta = CURRENCIES[code];
  const converted = php / meta.phpPerUnit;
  return `≈ ${meta.symbol}${Math.round(converted).toLocaleString("en-US")}`;
}
