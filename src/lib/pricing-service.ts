/**
 * Server-side pricing service. Loads live service config (options, MMR rank
 * bands, modifiers) from the DB — falling back to the shared catalog when the
 * DB is unreachable — and runs the pure pricing engine. Authoritative for both
 * /api/pricing/quote and order creation; the client price is never trusted.
 */
import "server-only";
import { prisma } from "./prisma";
import {
  computeMmrBase,
  computeUnitBase,
  finalizeQuote,
  tieredBase,
  type MmrBand,
  type ModifierInfo,
  type OptionInfo,
  type QuoteResult,
} from "./pricing";
import {
  FALLBACK_MODIFIERS,
  FALLBACK_RANKS,
  FALLBACK_SERVICES,
  type PublicModifier,
  type PublicRank,
  type PublicService,
} from "./fallback-data";
import type { QuoteInput } from "./validations/pricing";

export interface ServiceContext {
  service: PublicService;
  ranks: PublicRank[];
  modifiers: PublicModifier[];
}

export interface ServiceQuote extends QuoteResult {
  estimatedDelivery: string;
}

const mapRank = (r: {
  id: string;
  name: string;
  order: number;
  hasStars: boolean;
  maxStar: number;
  minMmr: number;
  maxMmr: number;
  pricePer100: number;
  iconUrl: string | null;
}): PublicRank => ({
  id: r.id,
  name: r.name,
  order: r.order,
  hasStars: r.hasStars,
  maxStar: r.maxStar,
  minMmr: r.minMmr,
  maxMmr: r.maxMmr,
  pricePer100: r.pricePer100,
  iconUrl: r.iconUrl ?? "",
});

const mapService = (service: {
  id: string;
  category: PublicService["category"];
  pricingMethod: PublicService["pricingMethod"];
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  deliveryEstimate: string;
  basePrice: number;
  unitPrice: number;
  unitLabel: string | null;
  minUnits: number;
  maxUnits: number;
  features: string[];
  imageUrl: string | null;
  options: Array<{
    groupKey: string;
    groupLabel: string;
    value: string;
    label: string;
    description: string | null;
    priceDelta: number;
    priceMultiplier: number;
    isDefault: boolean;
    sortOrder: number;
  }>;
}): PublicService => ({
  id: service.id,
  category: service.category,
  pricingMethod: service.pricingMethod,
  slug: service.slug,
  title: service.title,
  shortDescription: service.shortDescription,
  description: service.description,
  deliveryEstimate: service.deliveryEstimate,
  basePrice: service.basePrice,
  unitPrice: service.unitPrice,
  unitLabel: service.unitLabel,
  minUnits: service.minUnits,
  maxUnits: service.maxUnits,
  features: service.features,
  imageUrl: service.imageUrl,
  options: service.options.map((o) => ({
    groupKey: o.groupKey,
    groupLabel: o.groupLabel,
    value: o.value,
    label: o.label,
    description: o.description ?? undefined,
    priceDelta: o.priceDelta,
    priceMultiplier: o.priceMultiplier,
    isDefault: o.isDefault,
    sortOrder: o.sortOrder,
  })),
});

function bandsFromRanks(ranks: PublicRank[]): MmrBand[] {
  return ranks
    .filter((r) => r.maxMmr > 0)
    .map((r) => ({
      name: r.name,
      order: r.order,
      minMmr: r.minMmr,
      maxMmr: r.maxMmr,
      pricePer100: r.pricePer100,
    }));
}

// ── Loaders ──────────────────────────────────────────────────

function fallbackContext(slug: string): ServiceContext | null {
  const service = FALLBACK_SERVICES.find((s) => s.slug === slug);
  if (!service) return null;
  return { service, ranks: FALLBACK_RANKS, modifiers: FALLBACK_MODIFIERS };
}

async function loadContext(slug: string): Promise<ServiceContext | null> {
  try {
    const game = await prisma.game.findFirst({ where: { slug: "dota-2" } });
    if (!game) return fallbackContext(slug);

    const service = await prisma.service.findUnique({
      where: { slug },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
    if (!service) return fallbackContext(slug);

    const [ranks, modifierRows] = await Promise.all([
      prisma.rank.findMany({ where: { gameId: game.id }, orderBy: { order: "asc" } }),
      prisma.pricingModifier.findMany({
        where: {
          gameId: game.id,
          isActive: true,
          OR: [{ serviceCategory: null }, { serviceCategory: service.category }],
        },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
    if (ranks.length === 0) return fallbackContext(slug);

    return {
      service: mapService(service),
      ranks: ranks.map(mapRank),
      modifiers: modifierRows.map((m) => ({
        key: m.key,
        label: m.label,
        description: m.description ?? "",
        kind: m.kind,
        value: m.value,
        isBoostingMode: m.isBoostingMode,
        sortOrder: m.sortOrder,
      })),
    };
  } catch (err) {
    console.warn("[pricing] DB unavailable, using fallback:", (err as Error).message);
    return fallbackContext(slug);
  }
}

/** Bootstrap payload for the calculator: visible services + ranks + modifiers. */
export async function getCalculatorBootstrap(): Promise<{
  services: PublicService[];
  ranks: PublicRank[];
  modifiers: PublicModifier[];
}> {
  try {
    const game = await prisma.game.findFirst({ where: { slug: "dota-2" } });
    if (!game) throw new Error("no game");
    const [serviceRows, rankRows, modifierRows] = await Promise.all([
      prisma.service.findMany({
        where: { gameId: game.id, isActive: true, isVisible: true },
        orderBy: { sortOrder: "asc" },
        include: { options: { orderBy: { sortOrder: "asc" } } },
      }),
      prisma.rank.findMany({ where: { gameId: game.id }, orderBy: { order: "asc" } }),
      prisma.pricingModifier.findMany({
        where: { gameId: game.id, isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
    if (serviceRows.length === 0) throw new Error("no services");

    return {
      services: serviceRows.map(mapService),
      ranks: rankRows.map(mapRank),
      modifiers: modifierRows.map((m) => ({
        key: m.key,
        label: m.label,
        description: m.description ?? "",
        kind: m.kind,
        value: m.value,
        isBoostingMode: m.isBoostingMode,
        sortOrder: m.sortOrder,
      })),
    };
  } catch (err) {
    console.warn("[pricing] bootstrap fallback:", (err as Error).message);
    return {
      services: FALLBACK_SERVICES.filter((s) => s.slug !== "coaching"),
      ranks: FALLBACK_RANKS,
      modifiers: FALLBACK_MODIFIERS,
    };
  }
}

// ── Quote ────────────────────────────────────────────────────

function resolveOptions(ctx: ServiceContext, selections: Record<string, string>): OptionInfo[] {
  const result: OptionInfo[] = [];
  for (const [groupKey, value] of Object.entries(selections)) {
    const found = ctx.service.options.find((o) => o.groupKey === groupKey && o.value === value);
    if (found) {
      result.push({
        groupKey: found.groupKey,
        groupLabel: found.groupLabel,
        value: found.value,
        label: found.label,
        priceDelta: found.priceDelta,
        priceMultiplier: found.priceMultiplier,
      });
    }
  }
  return result;
}

function estimateDelivery(ctx: ServiceContext, input: QuoteInput): string {
  switch (ctx.service.category) {
    case "MMR_BOOSTING": {
      if (input.currentMmr == null || input.targetMmr == null) return ctx.service.deliveryEstimate;
      const diff = Math.max(0, input.targetMmr - input.currentMmr);
      const days = Math.max(1, Math.ceil(diff / 350));
      return `${days}–${days + 2} days`;
    }
    case "CALIBRATION":
      return "1–2 days";
    case "RANKED_WINS": {
      const q = input.quantity ?? 1;
      return q <= 3 ? "Same day" : `1–${Math.ceil(q / 5)} days`;
    }
    case "BATTLE_CUP":
      return "Next Battle Cup window";
    case "LOW_PRIORITY":
      return "Same day";
    default:
      return ctx.service.deliveryEstimate;
  }
}

export async function computeQuoteForSlug(input: QuoteInput): Promise<ServiceQuote> {
  const ctx = await loadContext(input.serviceSlug);
  if (!ctx) {
    return {
      ...finalizeQuote({ valid: false, error: "Service not found.", base: 0, breakdown: [] }, [], []),
      estimatedDelivery: "—",
    };
  }

  const options = resolveOptions(ctx, input.optionSelections ?? {});
  const modifiers: ModifierInfo[] = ctx.modifiers
    .filter((m) => input.modifierKeys.includes(m.key))
    .map((m) => ({ key: m.key, label: m.label, kind: m.kind, value: m.value, sortOrder: m.sortOrder }));

  let base;
  switch (ctx.service.pricingMethod) {
    case "MMR_RANGE":
      base =
        input.currentMmr != null && input.targetMmr != null
          ? computeMmrBase(bandsFromRanks(ctx.ranks), input.currentMmr, input.targetMmr)
          : { valid: false, error: "Set your current and target MMR.", base: 0, breakdown: [] };
      break;
    case "PER_UNIT":
    case "SESSION":
      base = computeUnitBase(
        ctx.service.unitPrice,
        input.quantity ?? ctx.service.minUnits,
        ctx.service.unitLabel ?? "unit",
        ctx.service.minUnits,
        ctx.service.maxUnits,
      );
      break;
    case "TIERED":
      base = tieredBase();
      break;
    default:
      base = { valid: false, error: "Unsupported service.", base: 0, breakdown: [] };
  }

  const quote = finalizeQuote(base, options, modifiers);
  return { ...quote, estimatedDelivery: estimateDelivery(ctx, input) };
}
