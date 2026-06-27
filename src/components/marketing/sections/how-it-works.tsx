import { CreditCard, MousePointerClick, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { T } from "@/components/i18n/t";

const STEPS = [
  { icon: MousePointerClick, key: "how.s1" },
  { icon: CreditCard, key: "how.s2" },
  { icon: Trophy, key: "how.s3" },
];

export function HowItWorks() {
  return (
    <section className="relative border-y border-white/[0.06] bg-ink-800/30 py-20 sm:py-28 lg:py-32">
      <div className="container">
        <SectionHeading
          eyebrow={<T k="sec.how.eyebrow" />}
          title={
            <>
              <T k="sec.how.lead" />{" "}
              <span className="gold-text">
                <T k="sec.how.accent" />
              </span>
            </>
          }
          description={<T k="sec.how.desc" />}
        />

        <div className="relative mt-12 grid gap-10 sm:mt-16 sm:gap-8 md:grid-cols-3">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent md:block" />

          {STEPS.map((step, i) => (
            <Reveal key={step.key} delay={i}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex size-16 items-center justify-center rounded-2xl border border-gold/20 bg-ink-900 text-gold shadow-gold">
                  <step.icon className="size-7" />
                  <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-gold-gradient text-xs font-bold text-ink-900">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-white">
                  <T k={`${step.key}.title`} />
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  <T k={`${step.key}.desc`} />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
