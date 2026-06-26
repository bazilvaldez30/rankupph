/**
 * Read-only data-access helpers for public pages. Each wraps Prisma with a
 * graceful fallback so pages still render if the DB is unreachable (build /
 * pre-Supabase). Real data always takes precedence.
 */
import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { timeAgo } from "./format";
import {
  FALLBACK_RANKS,
  FALLBACK_REVIEWS,
  FALLBACK_SERVICES,
  type PublicRank,
  type PublicReview,
  type PublicService,
} from "./fallback-data";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn("[queries] DB unavailable, using fallback:", (err as Error).message);
    return fallback;
  }
}

type ServiceWithOptions = Prisma.ServiceGetPayload<{ include: { options: true } }>;

function toPublicService(s: ServiceWithOptions): PublicService {
  return {
    id: s.id,
    category: s.category,
    pricingMethod: s.pricingMethod,
    slug: s.slug,
    title: s.title,
    shortDescription: s.shortDescription,
    description: s.description,
    deliveryEstimate: s.deliveryEstimate,
    basePrice: s.basePrice,
    unitPrice: s.unitPrice,
    unitLabel: s.unitLabel,
    minUnits: s.minUnits,
    maxUnits: s.maxUnits,
    features: s.features,
    imageUrl: s.imageUrl,
    options: [...s.options]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((o) => ({
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
  };
}

export async function getActiveGame() {
  return safe(
    () => prisma.game.findFirst({ where: { slug: "dota-2", isActive: true } }),
    null,
  );
}

/** Visible services for listings. Coaching is hidden by default. */
export async function getServices(): Promise<PublicService[]> {
  return safe(async () => {
    const rows = await prisma.service.findMany({
      where: { isActive: true, isVisible: true },
      orderBy: { sortOrder: "asc" },
      include: { options: true },
    });
    if (rows.length === 0) return FALLBACK_SERVICES.filter((s) => s.slug !== "coaching");
    return rows.map(toPublicService);
  }, FALLBACK_SERVICES.filter((s) => s.slug !== "coaching"));
}

export async function getServiceBySlug(slug: string): Promise<PublicService | null> {
  const fallback = FALLBACK_SERVICES.find((f) => f.slug === slug) ?? null;
  return safe(async () => {
    const s = await prisma.service.findUnique({
      where: { slug },
      include: { options: true },
    });
    return s ? toPublicService(s) : fallback;
  }, fallback);
}

export async function getRanks(): Promise<PublicRank[]> {
  return safe(async () => {
    const game = await prisma.game.findFirst({ where: { slug: "dota-2" } });
    if (!game) return FALLBACK_RANKS;
    const ranks = await prisma.rank.findMany({
      where: { gameId: game.id },
      orderBy: { order: "asc" },
    });
    if (ranks.length === 0) return FALLBACK_RANKS;
    return ranks.map((r) => ({
      id: r.id,
      name: r.name,
      order: r.order,
      hasStars: r.hasStars,
      maxStar: r.maxStar,
      minMmr: r.minMmr,
      maxMmr: r.maxMmr,
      pricePer100: r.pricePer100,
      iconUrl: r.iconUrl ?? "",
    }));
  }, FALLBACK_RANKS);
}

function toPublicReview(r: {
  id: string;
  rating: number;
  comment: string | null;
  tags: string[];
  country: string | null;
  isVerified: boolean;
  createdAt: Date;
  customer: { name: string | null };
}): PublicReview {
  return {
    id: r.id,
    rating: r.rating,
    comment: r.comment ?? "",
    tags: r.tags,
    country: r.country,
    isVerified: r.isVerified,
    authorName: r.customer.name ?? "Verified Customer",
    dateLabel: timeAgo(r.createdAt),
    createdAt: r.createdAt.toISOString(),
  };
}

export interface RatingAggregate {
  count: number;
  average: number;
}

/** Real aggregate rating from APPROVED (published) reviews for one service. */
export async function getServiceRatingAggregate(
  serviceId: string,
): Promise<RatingAggregate> {
  return safe(async () => {
    const res = await prisma.review.aggregate({
      where: { serviceId, isPublished: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    return { count: res._count._all, average: res._avg.rating ?? 0 };
  }, { count: 0, average: 0 });
}

/** Real aggregate rating across ALL approved reviews (sitewide). */
export async function getSiteRatingAggregate(): Promise<RatingAggregate> {
  return safe(async () => {
    const res = await prisma.review.aggregate({
      where: { isPublished: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    return { count: res._count._all, average: res._avg.rating ?? 0 };
  }, { count: 0, average: 0 });
}

export async function getPublishedReviews(limit = 6): Promise<PublicReview[]> {
  return safe(async () => {
    const rows = await prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { customer: { select: { name: true } } },
    });
    if (rows.length === 0) return FALLBACK_REVIEWS;
    return rows.map(toPublicReview);
  }, FALLBACK_REVIEWS);
}

export async function getServiceReviews(
  serviceId: string,
  limit = 8,
): Promise<PublicReview[]> {
  return safe(async () => {
    const rows = await prisma.review.findMany({
      where: { serviceId, isPublished: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { customer: { select: { name: true } } },
    });
    return rows.map(toPublicReview);
  }, FALLBACK_REVIEWS.slice(0, 3));
}
