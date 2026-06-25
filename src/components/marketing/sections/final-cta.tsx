import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-gradient-to-b from-ink-700 to-ink-900 px-6 py-16 text-center sm:px-16 sm:py-24">
            <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/15 blur-[120px]" />
            <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-30" />

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium text-gold">
                <ShieldCheck className="size-3.5" />
                Risk-free · Satisfaction guaranteed
              </span>

              <h2 className="mt-6 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
                Your next rank is
                <br />
                <span className="gold-text">closer than you think.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Join competitive players worldwide who climbed with RankUpPH.
                Premium Dota 2 services across all major regions — get an instant
                quote and start today.
              </p>

              <p className="mt-3 text-sm text-gold">
                Competitive Pricing. Global Coverage. · Secure Payments via Stripe
                and GCash.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="xl" className="w-full sm:w-auto">
                  <Link href="/pricing-calculator">
                    Get Your Instant Quote
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto"
                >
                  <Link href="/services">Browse Services</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
