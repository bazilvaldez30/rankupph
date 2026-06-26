import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { PricingCalculator } from "@/components/calculator/pricing-calculator";
import { getCalculatorBootstrap } from "@/lib/pricing-service";
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
    <div className="relative py-16 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[130px]" />
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
