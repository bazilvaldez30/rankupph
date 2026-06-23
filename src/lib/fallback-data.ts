/**
 * Offline fallback catalog, derived from the shared `catalog-data.ts`. Used only
 * when the database is unreachable so public pages and the calculator still work
 * (pre-Supabase builds / demos). Real DB data always wins.
 */
import {
  MODIFIERS_DATA,
  RANKS_DATA,
  REVIEWS_DATA,
  SERVICES_DATA,
  type OptionData,
  type ServiceCategoryKey,
  type PricingMethodKey,
} from "./catalog-data";

export type PublicServiceOption = OptionData;

export interface PublicService {
  id: string;
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
  imageUrl: string | null;
  options: PublicServiceOption[];
}

export interface PublicModifier {
  key: string;
  label: string;
  description: string;
  kind: "MULTIPLIER" | "FLAT";
  value: number;
  isBoostingMode: boolean;
  sortOrder: number;
}

export interface PublicReview {
  id: string;
  rating: number;
  comment: string;
  tags: string[];
  country: string | null;
  isVerified: boolean;
  authorName: string;
  dateLabel: string;
}

export interface PublicRank {
  id: string;
  name: string;
  order: number;
  hasStars: boolean;
  maxStar: number;
  minMmr: number;
  maxMmr: number;
  pricePer100: number;
  iconUrl: string;
}

export const FALLBACK_SERVICES: PublicService[] = SERVICES_DATA.map((s) => ({
  ...s,
  id: `fallback-${s.slug}`,
  imageUrl: null,
}));

export const FALLBACK_RANKS: PublicRank[] = RANKS_DATA.map((r) => ({
  ...r,
  id: `fb-rank-${r.order}`,
}));

export const FALLBACK_MODIFIERS: PublicModifier[] = MODIFIERS_DATA.map((m) => ({
  key: m.key,
  label: m.label,
  description: m.description,
  kind: m.kind,
  value: m.value,
  isBoostingMode: m.isBoostingMode,
  sortOrder: m.sortOrder,
}));

const FALLBACK_DATE_LABELS = ["2d ago", "5d ago", "1w ago", "2w ago", "3w ago", "1mo ago"];

export const FALLBACK_REVIEWS: PublicReview[] = REVIEWS_DATA.map((r, i) => ({
  id: `fb-review-${i}`,
  rating: r.rating,
  comment: r.comment,
  tags: r.tags,
  country: r.country,
  isVerified: true,
  authorName: "Verified Customer",
  dateLabel: FALLBACK_DATE_LABELS[i % FALLBACK_DATE_LABELS.length]!,
}));

