"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  CreditCard,
  Globe,
  Globe2,
  Headphones,
  Radar,
  Smartphone,
} from "lucide-react";
import { Counter } from "@/components/shared/counter";
import { Reveal } from "@/components/shared/reveal";
import { useT } from "@/hooks/use-translation";

const STRIP = [
  { icon: Globe, key: "trust.s1" },
  { icon: CreditCard, key: "trust.s2" },
  { icon: Smartphone, key: "trust.s3" },
  { icon: BadgeCheck, key: "trust.s4" },
  { icon: Radar, key: "trust.s5" },
  { icon: Headphones, key: "trust.s6" },
  { icon: Globe2, key: "trust.s7" },
];

type Stat = { value: number; suffix: string; key: string };

const STATS: Stat[] = [
  { value: 10000, suffix: "+", key: "trust.stat1" },
  { value: 500, suffix: "+", key: "trust.stat2" },
  { value: 95, suffix: "%+", key: "trust.stat3" },
];

export function GlobalTrust() {
  const t = useT();
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-ink-800/30 py-16 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-gold/[0.05] blur-[130px]" />
      <div className="container relative">
        {/* Premium trust strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {STRIP.map((item, i) => (
            <Reveal key={item.key} delay={i}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 text-center backdrop-blur-xl transition-colors hover:border-gold/30"
              >
                <span className="flex size-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.06] text-gold transition-transform group-hover:scale-110">
                  <item.icon className="size-5" />
                </span>
                <span className="text-sm font-medium text-foreground/90">
                  {t(item.key)}
                </span>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Supporting text */}
        <Reveal delay={1}>
          <p className="mx-auto mt-12 max-w-3xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("trust.para")}
          </p>
        </Reveal>

        {/* Statistics */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <Reveal key={stat.key} delay={i}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-7 text-center backdrop-blur-xl transition-colors hover:border-gold/30"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-gold/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative font-display text-3xl font-bold text-white sm:text-4xl">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="relative mt-2 text-sm text-muted-foreground">
                  {t(stat.key)}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
