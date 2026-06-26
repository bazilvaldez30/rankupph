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

const STRIP = [
  { icon: Globe, label: "Global Service Coverage" },
  { icon: CreditCard, label: "Secure Stripe Payments" },
  { icon: Smartphone, label: "GCash Supported" },
  { icon: BadgeCheck, label: "Verified High-Rank Boosters" },
  { icon: Radar, label: "Real-Time Order Tracking" },
  { icon: Headphones, label: "24/7 Customer Support" },
  { icon: Globe2, label: "Worldwide Availability" },
];

type Stat = { value: number; suffix: string; label: string };

const STATS: Stat[] = [
  { value: 10000, suffix: "+", label: "MMR Boosted" },
  { value: 500, suffix: "+", label: "Completed Orders" },
  { value: 95, suffix: "%+", label: "Satisfaction Rate" },
];

export function GlobalTrust() {
  return (
    <section className="relative border-y border-white/[0.06] bg-ink-800/30 py-20 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-gold/[0.05] blur-[130px]" />
      <div className="container relative">
        {/* Premium trust strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {STRIP.map((item, i) => (
            <Reveal key={item.label} delay={i}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 text-center backdrop-blur-xl transition-colors hover:border-gold/30"
              >
                <span className="flex size-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.06] text-gold transition-transform group-hover:scale-110">
                  <item.icon className="size-5" />
                </span>
                <span className="text-sm font-medium text-foreground/90">
                  {item.label}
                </span>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Supporting text */}
        <Reveal delay={1}>
          <p className="mx-auto mt-12 max-w-3xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
            From{" "}
            <span className="text-foreground">SEA grinders</span> to{" "}
            <span className="text-foreground">EU, NA, and beyond</span> — RankUpPH
            helps players across{" "}
            <span className="text-foreground">all major Dota 2 regions</span> reach
            their goals faster through professional{" "}
            <span className="text-foreground">boosting</span> and{" "}
            <span className="text-foreground">calibration</span> services.{" "}
            <span className="text-gold">Competitive pricing. Global coverage.</span>
          </p>
        </Reveal>

        {/* Statistics */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i}>
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
                  {stat.label}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
