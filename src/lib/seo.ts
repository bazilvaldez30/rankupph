/**
 * Structured-data (JSON-LD) builders, per schema.org + Google's Structured Data
 * guidelines. AggregateRating and Review data are ALWAYS derived from real,
 * approved (published) reviews in the database — never fabricated. When there
 * are no approved reviews, no aggregateRating/review is emitted.
 */
import { SITE } from "./constants";
import { env } from "./env";

const BASE = env.appUrl;

export interface SchemaReview {
  rating: number;
  authorName: string;
  comment: string;
  createdAt?: string; // ISO
}

export interface RatingAggregate {
  count: number;
  average: number; // 0..5
}

function ratingNode(agg: RatingAggregate) {
  return {
    "@type": "AggregateRating",
    ratingValue: agg.average.toFixed(1),
    reviewCount: agg.count,
    bestRating: 5,
    worstRating: 1,
  };
}

export function reviewNode(r: SchemaReview) {
  return {
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: { "@type": "Person", name: r.authorName },
    ...(r.comment ? { reviewBody: r.comment } : {}),
    ...(r.createdAt ? { datePublished: r.createdAt.slice(0, 10) } : {}),
  };
}

export function organizationSchema(aggregate?: RatingAggregate) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE}/#organization`,
    name: SITE.legalName,
    alternateName: SITE.name,
    url: BASE,
    description: SITE.description,
    email: SITE.supportEmail,
    logo: `${BASE}/rankup-logo.png`,
    sameAs: [`https://twitter.com/${SITE.twitter.replace("@", "")}`],
    // Only include a rating when real approved reviews exist.
    ...(aggregate && aggregate.count > 0
      ? { aggregateRating: ratingNode(aggregate) }
      : {}),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE}/#website`,
    name: SITE.name,
    url: BASE,
    description: SITE.description,
    publisher: { "@id": `${BASE}/#organization` },
  };
}

export function serviceSchema(opts: {
  title: string;
  slug: string;
  shortDescription: string;
  basePrice: number; // centavos PHP
  aggregate?: RatingAggregate;
  reviews?: SchemaReview[];
}) {
  const url = `${BASE}/services/${opts.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.title,
    serviceType: opts.title,
    description: opts.shortDescription,
    url,
    provider: { "@id": `${BASE}/#organization`, "@type": "Organization", name: SITE.legalName, url: BASE },
    areaServed: { "@type": "Place", name: "Worldwide" },
    offers: {
      "@type": "Offer",
      price: (opts.basePrice / 100).toFixed(2),
      priceCurrency: "PHP",
      url,
      availability: "https://schema.org/InStock",
    },
    ...(opts.aggregate && opts.aggregate.count > 0
      ? { aggregateRating: ratingNode(opts.aggregate) }
      : {}),
    ...(opts.reviews && opts.reviews.length > 0
      ? { review: opts.reviews.map(reviewNode) }
      : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE}${it.path}`,
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function serviceListSchema(
  services: { title: string; shortDescription: string; slug: string; basePrice: number }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.shortDescription,
        url: `${BASE}/services/${s.slug}`,
        offers: {
          "@type": "Offer",
          price: (s.basePrice / 100).toFixed(2),
          priceCurrency: "PHP",
        },
      },
    })),
  };
}
