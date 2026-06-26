import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { PricingCalculator } from "@/components/calculator/pricing-calculator";
import { getCalculatorBootstrap } from "@/lib/pricing-service";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";
import { ShieldCheck, Sparkles, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Dota 2 Boosting Price Calculator",
  description:
    "Calculate the exact cost of your Dota 2 MMR boost, calibration, ranked wins, Battle Cup, or low-priority removal. Transparent, configurable pricing — worldwide.",
  alternates: { canonical: "/pricing-calculator" },
};

const ASSURANCES = [
  { icon: Wallet, text: "Transparent, configurable pricing" },
  { icon: ShieldCheck, text: "Secure Stripe & GCash checkout" },
  { icon: Sparkles, text: "Verified Immortal boosters" },
];

export default async function PricingCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const { services, ranks, modifiers } = await getCalculatorBootstrap();

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
          />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {ASSURANCES.map((a) => (
              <div key={a.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <a.icon className="size-4 text-gold" />
                {a.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
