import { CreditCard, MousePointerClick, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Choose Your Service",
    description:
      "Pick MMR boost, duo queue, or coaching. Set your current and target rank in seconds with our live calculator.",
  },
  {
    icon: CreditCard,
    title: "Complete Payment",
    description:
      "Pay securely via Stripe or GCash. Your order is confirmed the moment payment clears — no risk, full transparency.",
  },
  {
    icon: Trophy,
    title: "Reach Your Goal",
    description:
      "A verified Immortal booster gets assigned. Track progress live, chat directly, and confirm when you hit your rank.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative border-y border-white/[0.06] bg-ink-800/30 py-24 sm:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="How It Works"
          title={
            <>
              From order to victory in <span className="gold-text">3 steps.</span>
            </>
          }
          description="A frictionless, transparent process designed so you always know exactly what's happening with your climb."
        />

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent md:block" />

          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex size-16 items-center justify-center rounded-2xl border border-gold/20 bg-ink-900 text-gold shadow-gold">
                  <step.icon className="size-7" />
                  <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-gold-gradient text-xs font-bold text-ink-900">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
