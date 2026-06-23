/**
 * Money helpers. Amounts are stored as integer centavos (PHP).
 * Always format from centavos so we never carry floats through the app.
 */

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format integer centavos as a PHP currency string, e.g. 150000 -> "₱1,500". */
export function formatCentavos(centavos: number): string {
  return phpFormatter.format(Math.round(centavos) / 100);
}

/** Pesos (decimal) -> centavos (int). */
export function toCentavos(pesos: number): number {
  return Math.round(pesos * 100);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Short relative label, e.g. "Today", "5d ago", "3w ago", "2mo ago". */
export function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "Today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** ISO-3166 alpha-2 code → flag emoji (e.g. "PH" → 🇵🇭). */
export function countryFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "🌐";
  const base = 0x1f1e6;
  const cc = code.toUpperCase();
  return String.fromCodePoint(
    base + (cc.charCodeAt(0) - 65),
    base + (cc.charCodeAt(1) - 65),
  );
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
