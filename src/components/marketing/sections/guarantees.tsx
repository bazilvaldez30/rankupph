import { BadgeCheck, CreditCard, RefreshCcw, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { Carousel } from "@/components/shared/carousel";
import { T } from "@/components/i18n/t";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";

const GUARANTEES = [
  { icon: RefreshCcw, key: "g.g1" },
  { icon: BadgeCheck, key: "g.g2" },
  { icon: CreditCard, key: "g.g3" },
  { icon: ShieldCheck, key: "g.g4" },
];

export function Guarantees() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <CinematicBackdrop image="/aegis.png" opacity={0.08} glow="top" />
      <div className="container relative">
        <SectionHeading
          eyebrow={<T k="sec.guarantees.eyebrow" />}
          title={
            <>
              <T k="sec.guarantees.lead" />{" "}
              <span className="gold-text">
                <T k="sec.guarantees.accent" />
              </span>
            </>
          }
          description={<T k="sec.guarantees.desc" />}
        />

        <Carousel
          className="mt-12 sm:mt-14"
          desktopClassName="md:grid-cols-2 lg:grid-cols-4"
          itemBasis="basis-[80%] sm:basis-[44%]"
        >
          {GUARANTEES.map((g, i) => (
            <Reveal key={g.key} delay={i % 4} className="h-full">
              <div className="flex h-full flex-col rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-gold/25">
                <span className="flex size-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.06] text-gold">
                  <g.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold text-white">
                  <T k={`${g.key}.title`} />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  <T k={`${g.key}.desc`} />
                </p>
              </div>
            </Reveal>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
