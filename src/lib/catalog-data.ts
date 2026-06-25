/**
 * Canonical Dota 2 catalog data — the SINGLE source of truth shared by the DB
 * seed (`prisma/seed.ts`) and the offline fallback (`fallback-data.ts`). Plain
 * data only (no Prisma / server imports) so it runs in Node and the browser.
 *
 * Money is centavos. Multipliers are basis points (10000 = ×1.0).
 */

export type ServiceCategoryKey =
  | "MMR_BOOSTING"
  | "CALIBRATION"
  | "RANKED_WINS"
  | "BATTLE_CUP"
  | "LOW_PRIORITY"
  | "COACHING";

export type PricingMethodKey = "MMR_RANGE" | "PER_UNIT" | "TIERED" | "SESSION";
export type ModifierKindKey = "MULTIPLIER" | "FLAT";

const peso = (n: number) => Math.round(n * 100);

export interface OptionData {
  groupKey: string;
  groupLabel: string;
  value: string;
  label: string;
  description?: string;
  priceDelta: number; // centavos
  priceMultiplier: number; // bp
  isDefault: boolean;
  sortOrder: number;
}

export interface ServiceData {
  category: ServiceCategoryKey;
  pricingMethod: PricingMethodKey;
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
  isVisible: boolean;
  sortOrder: number;
  options: OptionData[];
}

export interface ModifierData {
  key: string;
  label: string;
  description: string;
  kind: ModifierKindKey;
  value: number;
  isBoostingMode: boolean;
  sortOrder: number;
}

export interface ReviewData {
  rating: number;
  country: string;
  tags: string[];
  comment: string;
}

export interface RankData {
  name: string;
  order: number;
  hasStars: boolean;
  maxStar: number;
  minMmr: number;
  maxMmr: number;
  pricePer100: number; // centavos per 100 MMR climbed within this band
  iconUrl: string; // optional official medal image ("" → SVG emblem fallback)
}

// MMR bands chosen so 4000 & 4500 → Ancient and 5500 → Immortal (per spec).
// pricePer100 rises with rank — higher MMR is harder to climb. All DB-editable.
export const RANKS_DATA: RankData[] = [
  { name: "Herald", order: 1, hasStars: true, maxStar: 5, minMmr: 0, maxMmr: 769, pricePer100: peso(90), iconUrl: "/SeasonalRank1-1.png" },
  { name: "Guardian", order: 2, hasStars: true, maxStar: 5, minMmr: 770, maxMmr: 1539, pricePer100: peso(110), iconUrl: "/SeasonalRank2-1.png" },
  { name: "Crusader", order: 3, hasStars: true, maxStar: 5, minMmr: 1540, maxMmr: 2309, pricePer100: peso(140), iconUrl: "/SeasonalRank3-1.png" },
  { name: "Archon", order: 4, hasStars: true, maxStar: 5, minMmr: 2310, maxMmr: 3079, pricePer100: peso(190), iconUrl: "/SeasonalRank4-1.png" },
  { name: "Legend", order: 5, hasStars: true, maxStar: 5, minMmr: 3080, maxMmr: 3849, pricePer100: peso(280), iconUrl: "/SeasonalRank5-1.png" },
  { name: "Ancient", order: 6, hasStars: true, maxStar: 5, minMmr: 3850, maxMmr: 4619, pricePer100: peso(440), iconUrl: "/SeasonalRank6-1.png" },
  { name: "Divine", order: 7, hasStars: true, maxStar: 5, minMmr: 4620, maxMmr: 5619, pricePer100: peso(680), iconUrl: "/SeasonalRank7-1.png" },
  { name: "Immortal", order: 8, hasStars: false, maxStar: 1, minMmr: 5620, maxMmr: 9000, pricePer100: peso(1200), iconUrl: "/SeasonalRankTop0.png" },
];

/** Slider bounds derived from the rank bands. */
export const MMR_MIN = RANKS_DATA[0]!.minMmr;
export const MMR_MAX = RANKS_DATA[RANKS_DATA.length - 1]!.maxMmr;

const opt = (
  groupKey: string,
  groupLabel: string,
  value: string,
  label: string,
  sortOrder: number,
  extra: Partial<OptionData> = {},
): OptionData => ({
  groupKey,
  groupLabel,
  value,
  label,
  priceDelta: 0,
  priceMultiplier: 10000,
  isDefault: false,
  sortOrder,
  ...extra,
});

const SERVERS: OptionData[] = [
  opt("server", "Server", "sea", "SEA", 1, { isDefault: true }),
  opt("server", "Server", "eu-west", "EU West", 2),
  opt("server", "Server", "eu-east", "EU East", 3),
  opt("server", "Server", "us-east", "US East", 4),
  opt("server", "Server", "us-west", "US West", 5),
  opt("server", "Server", "australia", "Australia", 6),
  opt("server", "Server", "russia", "Russia", 7),
  opt("server", "Server", "south-america", "South America", 8),
];

const QUEUE: OptionData[] = [
  opt("queue", "Queue Type", "solo", "Solo Queue", 1, { isDefault: true }),
  opt("queue", "Queue Type", "party", "Party Queue", 2),
];

const CALIBRATION_SKILL: OptionData[] = [
  opt("skill", "Estimated Skill Level", "herald-crusader", "Herald – Crusader", 1, { priceMultiplier: 10000, isDefault: true }),
  opt("skill", "Estimated Skill Level", "archon-legend", "Archon – Legend", 2, { priceMultiplier: 13000 }),
  opt("skill", "Estimated Skill Level", "ancient-divine", "Ancient – Divine", 3, { priceMultiplier: 17000 }),
  opt("skill", "Estimated Skill Level", "immortal", "Immortal", 4, { priceMultiplier: 22000 }),
];

const BATTLECUP_TIER: OptionData[] = [
  opt("tier", "Tier", "div-1", "Division I", 1, { priceDelta: peso(600), isDefault: true }),
  opt("tier", "Tier", "div-2", "Division II", 2, { priceDelta: peso(900) }),
  opt("tier", "Tier", "div-3", "Division III", 3, { priceDelta: peso(1300) }),
  opt("tier", "Tier", "div-4", "Division IV", 4, { priceDelta: peso(1800) }),
];

const BATTLECUP_REGION: OptionData[] = [
  opt("region", "Region", "sea", "Southeast Asia", 1, { isDefault: true }),
  opt("region", "Region", "eu", "Europe", 2),
  opt("region", "Region", "americas", "Americas", 3),
  opt("region", "Region", "china", "China", 4),
];

const LP_COMPLETION: OptionData[] = [
  opt("completion", "Completion Speed", "standard", "Standard", 1, { priceMultiplier: 10000, isDefault: true }),
  opt("completion", "Completion Speed", "express", "Express (faster)", 2, { priceMultiplier: 14000 }),
];

export const SERVICES_DATA: ServiceData[] = [
  {
    category: "MMR_BOOSTING",
    pricingMethod: "MMR_RANGE",
    slug: "mmr-boosting",
    title: "MMR Boosting",
    shortDescription: "A verified Immortal pro climbs your account to your target rank.",
    description:
      "Hand your climb to a verified Immortal booster. We play on your account discreetly, with VPN protection and offline-mode privacy, until you hit your desired medal. Track every win in real time and message your booster directly. No scripts, no cheats — pure skill.",
    deliveryEstimate: "1–3 days per rank",
    basePrice: peso(700),
    unitPrice: 0,
    unitLabel: null,
    minUnits: 1,
    maxUnits: 1,
    features: ["Verified Immortal boosters", "VPN & offline-mode privacy", "Live progress tracking", "Solo or Duo mode"],
    isVisible: true,
    sortOrder: 1,
    options: [...SERVERS, ...QUEUE],
  },
  {
    category: "CALIBRATION",
    pricingMethod: "PER_UNIT",
    slug: "calibration",
    title: "Calibration",
    shortDescription: "Maximize your seasonal calibration with pro-played matches.",
    description:
      "Start your season on the right foot. Our boosters play your calibration matches to secure the highest possible starting MMR. Choose how many matches and your estimated skill level for accurate pricing.",
    deliveryEstimate: "1–2 days",
    basePrice: peso(220),
    unitPrice: peso(220),
    unitLabel: "calibration match",
    minUnits: 1,
    maxUnits: 10,
    features: ["Maximized starting MMR", "Win-focused calibration", "Solo or Duo mode", "Discreet & secure"],
    isVisible: true,
    sortOrder: 2,
    options: [...CALIBRATION_SKILL],
  },
  {
    category: "RANKED_WINS",
    pricingMethod: "PER_UNIT",
    slug: "ranked-wins",
    title: "Ranked Wins",
    shortDescription: "Buy a guaranteed number of ranked wins on your account.",
    description:
      "Need a set number of wins? Our pros secure guaranteed ranked victories on your account. Pick your server, queue type, and how many wins you need.",
    deliveryEstimate: "Same day start",
    basePrice: peso(180),
    unitPrice: peso(180),
    unitLabel: "win",
    minUnits: 1,
    maxUnits: 50,
    features: ["Guaranteed wins", "Choose server & queue", "Solo or Duo mode", "Fast turnaround"],
    isVisible: true,
    sortOrder: 3,
    options: [...SERVERS, ...QUEUE],
  },
  {
    category: "BATTLE_CUP",
    pricingMethod: "TIERED",
    slug: "battle-cup",
    title: "Battle Cup",
    shortDescription: "Win your weekly Battle Cup bracket at any division.",
    description:
      "Take home the Battle Cup trophy. Our team carries your weekend bracket to victory at your chosen division and region. Simple, flat per-tier pricing.",
    deliveryEstimate: "Next Battle Cup window",
    basePrice: peso(600),
    unitPrice: 0,
    unitLabel: null,
    minUnits: 1,
    maxUnits: 1,
    features: ["Trophy guaranteed", "Any division", "All regions", "Solo or Duo mode"],
    isVisible: true,
    sortOrder: 4,
    options: [...BATTLECUP_TIER, ...BATTLECUP_REGION],
  },
  {
    category: "LOW_PRIORITY",
    pricingMethod: "PER_UNIT",
    slug: "low-priority",
    title: "Low Priority Removal",
    shortDescription: "Clear your low-priority games fast and get back to ranked.",
    description:
      "Stuck in low priority? Our boosters grind out your required low-priority wins quickly so you can return to ranked. Pick how many games and your completion speed.",
    deliveryEstimate: "Same day",
    basePrice: peso(90),
    unitPrice: peso(90),
    unitLabel: "low-priority game",
    minUnits: 1,
    maxUnits: 10,
    features: ["Fast LP clearing", "Standard or Express", "Solo or Duo mode", "Back to ranked quickly"],
    isVisible: true,
    sortOrder: 5,
    options: [...LP_COMPLETION],
  },
  {
    category: "COACHING",
    pricingMethod: "SESSION",
    slug: "coaching",
    title: "1-on-1 Coaching",
    shortDescription: "Personalized sessions with Immortal coaches to climb on your own.",
    description:
      "Book private sessions with top-tier Immortal coaches. We review your replays, fix decision-making, and build a climb plan tailored to your hero pool.",
    deliveryEstimate: "Scheduled — 1 hour per session",
    basePrice: peso(600),
    unitPrice: peso(600),
    unitLabel: "coaching session",
    minUnits: 1,
    maxUnits: 20,
    features: ["Immortal-ranked coaches", "Replay analysis", "Personalized climb plan", "Hero pool guidance"],
    isVisible: false,
    sortOrder: 6,
    options: [],
  },
];

export const MODIFIERS_DATA: ModifierData[] = [
  { key: "DUO_QUEUE", label: "Duo Queue", description: "Play alongside your booster — 100% safe, you keep playing.", kind: "MULTIPLIER", value: 13000, isBoostingMode: true, sortOrder: 0 },
  { key: "EXPRESS", label: "Express Delivery", description: "Your order is prioritized and finished significantly faster.", kind: "MULTIPLIER", value: 12000, isBoostingMode: false, sortOrder: 1 },
  { key: "PRIORITY", label: "Priority Queue", description: "Jump to the front of the booster queue.", kind: "MULTIPLIER", value: 12000, isBoostingMode: false, sortOrder: 2 },
  { key: "STREAM", label: "Live Streaming", description: "Watch a private stream of every game played.", kind: "MULTIPLIER", value: 11000, isBoostingMode: false, sortOrder: 3 },
];

export const REVIEWS_DATA: ReviewData[] = [
  { rating: 5, country: "PH", tags: ["Fast Delivery", "Professional"], comment: "Went from Archon 2 to Legend 4 in four days. The booster messaged me every session — felt completely safe and professional." },
  { rating: 5, country: "SG", tags: ["Great Communication", "Recommended"], comment: "Duo queue was unreal. I actually learned my mistakes while climbing. Communication was top tier the whole way." },
  { rating: 5, country: "MY", tags: ["Premium Service", "High Quality"], comment: "Cleanest service I've used. GCash was instant and the dashboard kept me updated the entire time." },
  { rating: 5, country: "US", tags: ["Fast Delivery", "Recommended"], comment: "Calibration matches all wins. Started the season way higher than expected. Will use again." },
  { rating: 4, country: "ID", tags: ["Professional", "Great Communication"], comment: "Solid ranked wins service. Took a bit to start but the booster delivered exactly what was promised." },
  { rating: 5, country: "AU", tags: ["High Quality", "Premium Service"], comment: "Low priority cleared same day. Back to ranked in hours. Genuinely premium experience end to end." },
];
