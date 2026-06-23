"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/shared/counter";
import { LiveActivity } from "@/components/marketing/live-activity";

const TRUST = [
  { icon: ShieldCheck, label: "100% Secure & Private" },
  { icon: Zap, label: "Fast Delivery" },
  { icon: Star, label: "Immortal Boosters" },
];

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-24 sm:pt-32">
      {/* Animated backdrop */}
      <div className="pointer-events-none absolute inset-0 grid-backdrop" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[150px]"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium text-gold"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold/60" />
              <span className="relative inline-flex size-2 rounded-full bg-gold" />
            </span>
            Trusted by 3,000+ competitive Dota 2 players
          </motion.div>

          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            Reach Your Desired
            <br />
            Rank <span className="gold-text">Faster.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Professional Dota 2 MMR boosting, duo queue, and coaching — delivered
            by verified Immortal players. Secure, discreet, and built for
            competitive climbers.
          </motion.p>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/pricing-calculator">
                Calculate Your Boost
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="xl"
              className="w-full sm:w-auto"
            >
              <Link href="/services">Explore Services</Link>
            </Button>
          </motion.div>

          <motion.div
            custom={4}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            {TRUST.map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <t.icon className="size-4 text-gold" />
                {t.label}
              </div>
            ))}
          </motion.div>

          <motion.div
            custom={5}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-8 flex justify-center"
          >
            <LiveActivity />
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          custom={6}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] sm:grid-cols-4"
        >
          {[
            { value: 12000, suffix: "+", label: "Orders Completed" },
            { value: 3000, suffix: "+", label: "Happy Players" },
            { value: 98, suffix: "%", label: "Satisfaction" },
            { value: 24, suffix: "/7", label: "Support" },
          ].map((s) => (
            <div key={s.label} className="bg-ink-900/60 px-4 py-6 text-center">
              <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
