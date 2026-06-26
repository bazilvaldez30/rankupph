import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Clock, ShieldCheck } from "lucide-react";
import {
  getServiceBySlug,
  getServiceReviews,
  getServiceRatingAggregate,
} from "@/lib/queries";
import { ReviewCard } from "@/components/marketing/review-card";
import { getCalculatorBootstrap } from "@/lib/pricing-service";
import { SERVICE_CATEGORY_META } from "@/lib/constants";
import { PricingCalculator } from "@/components/calculator/pricing-calculator";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, serviceSchema } from "@/lib/seo";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";

// Subtle, category-flavoured backdrop art (safe fallback for any category).
const DETAIL_BG: Record<string, string> = {
  MMR_BOOST: "/battlefield.png",
  CALIBRATION: "/jungle.png",
  RANKED_WINS: "/ruines-2.png",
  BATTLE_CUP: "/battlefield.png",
  LOW_PRIORITY: "/ancient-ruines.png",
  COACHING: "/aegis.png",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service Not Found" };
  const path = `/services/${service.slug}`;
  return {
    title: service.title,
    description: service.shortDescription,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: `${service.title} · RankUpPH`,
      description: service.shortDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} · RankUpPH`,
      description: service.shortDescription,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [{ ranks, modifiers }, reviews, aggregate] = await Promise.all([
    getCalculatorBootstrap(),
    getServiceReviews(service.id, 8),
    getServiceRatingAggregate(service.id),
  ]);

  const meta = SERVICE_CATEGORY_META[service.category];

  // Structured data — aggregateRating/review only from real approved reviews.
  const serviceLd = serviceSchema({
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription,
    basePrice: service.basePrice,
    aggregate,
    reviews: reviews.map((r) => ({
      rating: r.rating,
      authorName: r.authorName,
      comment: r.comment,
      createdAt: r.createdAt,
    })),
  });
  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.title, path: `/services/${service.slug}` },
  ]);

  return (
    <div className="relative overflow-hidden py-12 sm:py-16">
      <CinematicBackdrop
        image={DETAIL_BG[service.category] ?? "/ancient-ruines.png"}
        opacity={0.07}
        glow="top"
      />
      <JsonLd data={[serviceLd, breadcrumbLd]} />
      <div className="container relative">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All services
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          {/* Left: details */}
          <div>
            <Reveal>
              <Badge tone="gold" className="mb-4">
                {meta.label}
              </Badge>
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {service.title}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </Reveal>

            <Reveal delay={1}>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Clock className="size-4 text-gold" />
                  {service.deliveryEstimate}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <ShieldCheck className="size-4 text-gold" />
                  Secure &amp; private
                </div>
              </div>
            </Reveal>

            <Reveal delay={2}>
              <div className="mt-10">
                <h2 className="font-display text-lg font-semibold text-white">
                  What&apos;s included
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-foreground/85"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {reviews.length > 0 && (
              <Reveal delay={3}>
                <div className="mt-12">
                  <h2 className="font-display text-lg font-semibold text-white">
                    Recent reviews
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {reviews.map((r) => (
                      <ReviewCard key={r.id} review={r} />
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* Right: order panel (sticky) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={1}>
              <PricingCalculator
                services={[service]}
                ranks={ranks}
                modifiers={modifiers}
                lockedSlug={service.slug}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
