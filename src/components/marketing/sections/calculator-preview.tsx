import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { PricingCalculator } from "@/components/calculator/pricing-calculator";
import { getCalculatorBootstrap } from "@/lib/pricing-service";
import { getFirstOrderOffer } from "@/lib/promo.server";
import { T } from "@/components/i18n/t";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";

export async function CalculatorPreview() {
  const [{ services, ranks, modifiers }, offer] = await Promise.all([
    getCalculatorBootstrap(),
    getFirstOrderOffer(),
  ]);

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <CinematicBackdrop image="/battlefield.png" opacity={0.09} glow="top" />
      <div className="container relative">
        <SectionHeading
          eyebrow={<T k="sec.calc.eyebrow" />}
          title={
            <>
              <T k="sec.calc.lead" />{" "}
              <span className="gold-text">
                <T k="sec.calc.accent" />
              </span>
            </>
          }
          description={<T k="sec.calc.desc" />}
        />

        <Reveal className="mx-auto mt-14 max-w-5xl">
          <PricingCalculator
            services={services}
            ranks={ranks}
            modifiers={modifiers}
            mode="preview"
            initialSlug="mmr-boosting"
            offer={offer}
          />
        </Reveal>
      </div>
    </section>
  );
}
