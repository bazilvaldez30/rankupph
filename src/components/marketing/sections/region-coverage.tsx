"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";

const REGIONS = [
  { flag: "🌏", name: "SEA", note: "Southeast Asia" },
  { flag: "🇪🇺", name: "Europe", note: "EU West & East" },
  { flag: "🇺🇸", name: "North America", note: "US East & West" },
  { flag: "🇧🇷", name: "South America", note: "LATAM servers" },
  { flag: "🇦🇺", name: "Australia", note: "OCE region" },
  { flag: "🇨🇳", name: "China", note: "Perfect World" },
  { flag: "🌍", name: "Middle East", note: "Dubai server" },
  { flag: "🇷🇺", name: "CIS", note: "Russia & East EU" },
];

export function RegionCoverage() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Global Reach"
          title={
            <>
              Available <span className="gold-text">Worldwide.</span>
            </>
          }
          description="We provide professional Dota 2 services for players across all major Dota 2 regions. Whether you're playing in SEA, Europe, North America, South America, Australia, China, or other supported regions, our team is ready to help."
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {REGIONS.map((region, i) => (
            <Reveal key={region.name} delay={i % 4}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group flex h-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl transition-colors hover:border-gold/30"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-gold/15 bg-gold/[0.05] text-2xl transition-transform group-hover:scale-110">
                  {region.flag}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold text-white">
                    {region.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {region.note}
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={1}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
            Don&apos;t see your region?{" "}
            <span className="text-foreground">
              We support every official Dota 2 server
            </span>{" "}
            — reach out and we&apos;ll take care of you.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
