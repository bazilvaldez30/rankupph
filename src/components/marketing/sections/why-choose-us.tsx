import { EyeOff, Headphones, ShieldCheck, Trophy, Wifi, Zap } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { T } from "@/components/i18n/t";

const REASONS = [
  { icon: Trophy, key: "why.r1" },
  { icon: Wifi, key: "why.r2" },
  { icon: EyeOff, key: "why.r3" },
  { icon: Zap, key: "why.r4" },
  { icon: ShieldCheck, key: "why.r5" },
  { icon: Headphones, key: "why.r6" },
];

export function WhyChooseUs() {
  return (
    <section
      id="why"
      className="relative border-y border-white/[0.06] bg-ink-800/30 py-20 sm:py-28 lg:py-32"
    >
      <div className="container">
        <SectionHeading
          align="left"
          eyebrow={<T k="sec.why.eyebrow" />}
          title={
            <>
              <T k="sec.why.lead" />
              <br />
              <span className="gold-text">
                <T k="sec.why.accent" />
              </span>
            </>
          }
          description={<T k="sec.why.desc" />}
          className="max-w-2xl"
        />

        <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6">
          {REASONS.map((r, i) => (
            <Reveal key={r.key} delay={i % 2} className="h-full">
              <div className="flex h-full gap-4 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:gap-5 sm:p-7">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.06] text-gold">
                  <r.icon className="size-6" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    <T k={`${r.key}.title`} />
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    <T k={`${r.key}.desc`} />
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
