import { BadgeCheck, CreditCard, RefreshCcw, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { Carousel } from "@/components/shared/carousel";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";

const GUARANTEES = [
  {
    icon: RefreshCcw,
    title: "Money-Back Guarantee",
    description:
      "If we can't deliver what was promised, you're protected. Verified concerns are eligible for a full refund.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Players Only",
    description:
      "Every booster is a vetted Immortal with a proven record. No bots, no scripts — real high-MMR gameplay.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Pay safely with Stripe or GCash. Encrypted checkout, and your order is confirmed only after payment clears.",
  },
  {
    icon: ShieldCheck,
    title: "Account Safety First",
    description:
      "VPN matching, offline mode, and strict privacy. Or go Duo and never share your account at all.",
  },
];

export function Guarantees() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <CinematicBackdrop image="/aegis.png" opacity={0.08} glow="top" />
      <div className="container relative">
        <SectionHeading
          eyebrow="Our Promise"
          title={
            <>
              Built to be <span className="gold-text">trusted.</span>
            </>
          }
          description="Premium service means premium protection. Here's what every order comes with — guaranteed."
        />

        <Carousel
          className="mt-12 sm:mt-14"
          desktopClassName="md:grid-cols-2 lg:grid-cols-4"
          itemBasis="basis-[80%] sm:basis-[44%]"
        >
          {GUARANTEES.map((g, i) => (
            <Reveal key={g.title} delay={i % 4} className="h-full">
              <div className="flex h-full flex-col rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-gold/25">
                <span className="flex size-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.06] text-gold">
                  <g.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold text-white">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {g.description}
                </p>
              </div>
            </Reveal>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
