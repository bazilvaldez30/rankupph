import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { PricingCalculator } from "@/components/calculator/pricing-calculator";
import { getCalculatorBootstrap } from "@/lib/pricing-service";
import { getFirstOrderOffer } from "@/lib/promo.server";
import { getSiteRatingAggregate } from "@/lib/queries";
import { FomoStrip } from "@/components/marketing/fomo-strip";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";

export const metadata: Metadata = {
  title: "Dota 2 Boosting Price Calculator",
  description:
    "Calculate the exact cost of your Dota 2 MMR boost, calibration, ranked wins, Battle Cup, or low-priority removal. Transparent, configurable pricing — worldwide.",
  alternates: { canonical: "/pricing-calculator" },
};

export default async function PricingCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const [{ services, ranks, modifiers }, offer, rating] = await Promise.all([
    getCalculatorBootstrap(),
    getFirstOrderOffer(),
    getSiteRatingAggregate(),
  ]);

  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      <CinematicBackdrop image="/jungle.png" opacity={0.08} glow="top" />
      <div className="container relative">
        <SectionHeading
          eyebrow="Pricing Calculator"
          title={
            <>
              Build your order, <span className="gold-text">see the price.</span>
            </>
          }
          description="Pick a service, configure your options, and your total updates live. Final price is confirmed at checkout."
        />

        <div className="mx-auto mt-12 max-w-6xl">
          <PricingCalculator
            services={services}
            ranks={ranks}
            modifiers={modifiers}
            initialSlug={service}
            offer={offer}
          />

          <FomoStrip
            className="mt-8"
            data={{ rating: rating.count > 0 ? rating.average : null }}
          />
        </div>
      </div>
    </div>
  );
}
