import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ_ITEMS = [
  {
    q: "Is boosting safe for my account?",
    a: "Yes. Our boosters use VPN matching your region and play in offline/invisible mode. We never use scripts or cheats — only genuine high-MMR gameplay. For maximum safety, choose Duo Queue and keep your account in your own hands the entire time.",
  },
  {
    q: "How long does a boost take?",
    a: "Most ranks are completed in 1–3 days each, depending on the MMR range and your account's behavior score. You'll see live progress in your dashboard, and you can enable Priority delivery to move faster.",
  },
  {
    q: "How do payments work?",
    a: "We accept secure card payments via Stripe and local GCash transfers. Your order is only confirmed once payment is verified — for GCash, an admin reviews your reference and screenshot, then marks the order paid automatically.",
  },
  {
    q: "Can I keep playing on my account?",
    a: "With MMR Boosting we ask that you don't play ranked while a booster is active, to avoid MMR conflicts. With Duo Queue, you play every game yourself alongside your booster — so you're always in control.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "You confirm the order only when your target rank is reached. Our support team is available 24/7 to resolve any issue, and verified concerns are eligible for our satisfaction guarantee.",
  },
  {
    q: "Do you offer coaching instead of boosting?",
    a: "Absolutely. Our 1-on-1 coaching pairs you with an Immortal coach for replay analysis, drafting, and mechanics. It's the best way to climb permanently with skills that stay yours.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <CinematicBackdrop image="/ancient-ruines.png" opacity={0.07} glow="bottom" />
      <div className="container relative">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Questions, <span className="gold-text">answered.</span>
            </>
          }
          description="Everything you need to know before you climb. Still curious? Our support team is one message away."
        />

        <Reveal className="mx-auto mt-12 max-w-3xl">
          <div className="glass rounded-3xl px-6 sm:px-8">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
