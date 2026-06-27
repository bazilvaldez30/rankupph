import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { T } from "@/components/i18n/t";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <CinematicBackdrop image="/ruines-2.png" opacity={0.08} glow="center" />
      <div className="container relative">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-gradient-to-b from-ink-700 to-ink-900 px-6 py-16 text-center sm:px-16 sm:py-24">
            <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/15 blur-[120px]" />
            <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-30" />

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium text-gold">
                <ShieldCheck className="size-3.5" />
                <T k="final.badge" />
              </span>

              <h2 className="mt-6 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
                <T k="final.lead" />
                <br />
                <span className="gold-text">
                  <T k="final.accent" />
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                <T k="final.desc" />
              </p>

              <p className="mt-3 text-sm text-gold">
                <T k="final.note" />
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="xl" className="w-full sm:w-auto">
                  <Link href="/pricing-calculator">
                    <T k="final.cta" />
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto"
                >
                  <Link href="/services">
                    <T k="final.browse" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
