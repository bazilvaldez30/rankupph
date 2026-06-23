import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { PricingCalculator } from "@/components/calculator/pricing-calculator";
import { getCalculatorBootstrap } from "@/lib/pricing-service";

export async function CalculatorPreview() {
  const { services, ranks, modifiers } = await getCalculatorBootstrap();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Instant Pricing"
          title={
            <>
              Know your price <span className="gold-text">before you commit.</span>
            </>
          }
          description="No hidden fees, no surprises. Configure your order and watch the price update live — every value is rank- and option-based."
        />

        <Reveal className="mx-auto mt-14 max-w-5xl">
          <PricingCalculator
            services={services}
            ranks={ranks}
            modifiers={modifiers}
            mode="preview"
            initialSlug="mmr-boosting"
          />
        </Reveal>
      </div>
    </section>
  );
}
