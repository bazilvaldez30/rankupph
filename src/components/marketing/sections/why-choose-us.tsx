import { EyeOff, Headphones, ShieldCheck, Trophy, Wifi, Zap } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";

const REASONS = [
  {
    icon: Trophy,
    title: "Experienced Players",
    description:
      "Every booster is a verified Immortal with a proven track record. We vet skill, reliability, and discretion before anyone touches an account.",
  },
  {
    icon: Wifi,
    title: "Automated VPN Protection",
    description:
      "Every session runs through a region-matched VPN, keeping your login pattern clean and your account shielded the entire time.",
  },
  {
    icon: EyeOff,
    title: "Strict Offline Mode",
    description:
      "Boosters play in offline / invisible mode, so your activity stays hidden from friends, clubs, and recent teammates.",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description:
      "Most orders start within hours. Need it faster? Priority delivery moves you to the front of the queue.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Encrypted",
    description:
      "Credentials are encrypted at rest and access is audit-logged. Or pick Duo Queue and never share your account at all.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "Real humans, around the clock. Chat directly with your booster and reach support any time during your order.",
  },
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
          eyebrow="Why RankUpPH"
          title={
            <>
              Built on trust.
              <br />
              <span className="gold-text">Engineered for results.</span>
            </>
          }
          description="We treat your account and your money with the seriousness they deserve. This is a premium service — and it shows in every detail."
          className="max-w-2xl"
        />

        <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={i % 2} className="h-full">
              <div className="flex h-full gap-4 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:gap-5 sm:p-7">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.06] text-gold">
                  <r.icon className="size-6" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {r.description}
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
