import { Gift, Users } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { REFERRAL } from "@/lib/promo";

/**
 * Future-ready referral section. The backend (codes, credit ledger) lands
 * later — for now this is an elegant teaser that sets the expectation.
 */
export function ReferralTeaser() {
  if (!REFERRAL.enabled && !REFERRAL.comingSoon) return null;

  return (
    <section className="relative py-20 sm:py-28">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-gradient-to-br from-ink-700 to-ink-900 p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gold/10 blur-[110px]" />
            <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/[0.08] text-gold">
                    <Users className="size-5" />
                  </span>
                  {REFERRAL.comingSoon && (
                    <span className="rounded-full border border-gold/25 bg-gold/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gold">
                      Coming soon
                    </span>
                  )}
                </div>
                <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Invite a friend, <span className="gold-text">both get rewarded.</span>
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  You and your friend each receive{" "}
                  <span className="font-semibold text-gold">
                    ₱{REFERRAL.creditPhp} credit
                  </span>{" "}
                  after their first completed order. Real rewards for real
                  recommendations — no spam, no catch.
                </p>
              </div>

              <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center lg:w-auto">
                <span className="flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.08] text-gold">
                  <Gift className="size-6" />
                </span>
                <p className="font-display text-2xl font-bold text-white">
                  ₱{REFERRAL.creditPhp} + ₱{REFERRAL.creditPhp}
                </p>
                <p className="text-sm text-muted-foreground">
                  Referral rewards are launching soon. Place an order today to be
                  ready.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
