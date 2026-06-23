/**
 * Pricing engine — single source of truth for all quotes. Pure & DB-agnostic:
 * the pricing-service feeds plain rows so the same math powers the landing
 * preview, the calculator, and the authoritative server-side order price. The
 * client quote is NEVER trusted.
 *
 * Unified pipeline:
 *   methodBase  → + option price deltas (e.g. Battle Cup tier)   = subtotal
 *               → × option multipliers (e.g. calibration skill)
 *               → × / + modifiers (Duo +30%, Express, etc.)      = total
 *
 * Methods:
 *   MMR_RANGE banded per-100-MMR across current→target (MMR Boosting)
 *   PER_UNIT  unitPrice × quantity (wins, matches, LP games)
 *   SESSION   unitPrice × sessions (coaching)
 *   TIERED    base 0; the selected tier option's priceDelta forms the price
 */

export interface MmrBand {
  name: string;
  order: number;
  minMmr: number;
  maxMmr: number;
  pricePer100: number; // centavos per 100 MMR within this band
}

export type ModifierKindLite = "MULTIPLIER" | "FLAT";

export interface ModifierInfo {
  key: string;
  label: string;
  kind: ModifierKindLite;
  value: number; // MULTIPLIER: basis points; FLAT: centavos
  sortOrder: number;
}

export interface OptionInfo {
  groupKey: string;
  groupLabel: string;
  value: string;
  label: string;
  priceDelta: number; // centavos
  priceMultiplier: number; // basis points (10000 = ×1.0)
}

export interface QuoteLine {
  label: string;
  amount: number; // centavos
}

export interface QuoteResult {
  valid: boolean;
  error?: string;
  currency: "PHP";
  subtotal: number; // base + priced options, before multipliers/modifiers
  breakdown: QuoteLine[];
  optionsApplied: QuoteLine[];
  modifiersApplied: QuoteLine[];
  total: number;
}

interface BaseResult {
  valid: boolean;
  error?: string;
  base: number;
  breakdown: QuoteLine[];
}

// ── Rank detection ───────────────────────────────────────────

/** Detect the medal band a given MMR falls into (clamped to the ends). */
export function rankFromMmr<T extends { minMmr: number; maxMmr: number; order: number }>(
  bands: T[],
  mmr: number,
): T | null {
  if (bands.length === 0) return null;
  const sorted = [...bands].sort((a, b) => a.order - b.order);
  const lowest = sorted[0]!;
  const highest = sorted[sorted.length - 1]!;
  if (mmr <= lowest.minMmr) return lowest;
  if (mmr >= highest.maxMmr) return highest;
  return sorted.find((b) => mmr >= b.minMmr && mmr <= b.maxMmr) ?? highest;
}

// ── MMR-range base (banded per-100) ──────────────────────────

export function computeMmrBase(
  bands: MmrBand[],
  currentMmr: number,
  targetMmr: number,
): BaseResult {
  if (bands.length === 0) {
    return { valid: false, error: "No pricing configured.", base: 0, breakdown: [] };
  }
  if (targetMmr <= currentMmr) {
    return {
      valid: false,
      error: "Target MMR must be higher than your current MMR.",
      base: 0,
      breakdown: [],
    };
  }

  const sorted = [...bands].sort((a, b) => a.order - b.order);
  const breakdown: QuoteLine[] = [];
  let base = 0;

  for (const band of sorted) {
    // Bands tile contiguously: [minMmr, maxMmr+1).
    const segStart = Math.max(currentMmr, band.minMmr);
    const segEnd = Math.min(targetMmr, band.maxMmr + 1);
    const mmrInBand = segEnd - segStart;
    if (mmrInBand > 0) {
      const cost = Math.round((mmrInBand / 100) * band.pricePer100);
      base += cost;
      breakdown.push({
        label: `${band.name} · ${segStart}–${segEnd} MMR`,
        amount: cost,
      });
    }
  }

  return { valid: true, base, breakdown };
}

export function computeUnitBase(
  unitPrice: number,
  quantity: number,
  unitLabel: string,
  min = 1,
  max = 100,
): BaseResult {
  if (!Number.isInteger(quantity) || quantity < min || quantity > max) {
    return { valid: false, error: `Choose between ${min} and ${max}.`, base: 0, breakdown: [] };
  }
  const base = unitPrice * quantity;
  const plural = quantity > 1 ? `${unitLabel}s` : unitLabel;
  return {
    valid: true,
    base,
    breakdown: [{ label: `${quantity} × ${plural}`, amount: base }],
  };
}

export const tieredBase = (): BaseResult => ({ valid: true, base: 0, breakdown: [] });

// ── Finalize: apply options then modifiers ───────────────────

const INVALID = (error: string): QuoteResult => ({
  valid: false,
  error,
  currency: "PHP",
  subtotal: 0,
  breakdown: [],
  optionsApplied: [],
  modifiersApplied: [],
  total: 0,
});

export function finalizeQuote(
  baseResult: BaseResult,
  options: OptionInfo[],
  modifiers: ModifierInfo[],
): QuoteResult {
  if (!baseResult.valid) return INVALID(baseResult.error ?? "Invalid configuration.");

  const breakdown = [...baseResult.breakdown];
  let running = baseResult.base;

  // 1) Option price deltas (e.g. Battle Cup tier) extend the base.
  for (const o of options) {
    if (o.priceDelta && o.priceDelta !== 0) {
      running += o.priceDelta;
      breakdown.push({ label: `${o.groupLabel}: ${o.label}`, amount: o.priceDelta });
    }
  }
  const subtotal = running;

  // 2) Option multipliers (e.g. calibration skill, completion speed).
  const optionsApplied: QuoteLine[] = [];
  for (const o of options) {
    if (o.priceMultiplier && o.priceMultiplier !== 10000) {
      const next = Math.round((running * o.priceMultiplier) / 10000);
      optionsApplied.push({ label: `${o.groupLabel}: ${o.label}`, amount: next - running });
      running = next;
    }
  }

  // 3) Modifiers (Duo +30%, Express, Priority, Streaming).
  const modifiersApplied: QuoteLine[] = [];
  for (const m of [...modifiers].sort((a, b) => a.sortOrder - b.sortOrder)) {
    if (m.kind === "MULTIPLIER") {
      const next = Math.round((running * m.value) / 10000);
      modifiersApplied.push({ label: m.label, amount: next - running });
      running = next;
    } else {
      running += m.value;
      modifiersApplied.push({ label: m.label, amount: m.value });
    }
  }

  return {
    valid: true,
    currency: "PHP",
    subtotal,
    breakdown,
    optionsApplied,
    modifiersApplied,
    total: running,
  };
}
