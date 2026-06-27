"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveActivity } from "@/components/marketing/live-activity";
import { FIRST_ORDER, firstOrderActive } from "@/lib/promo";
import { useT } from "@/hooks/use-translation";

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden pb-16 pt-24 sm:pt-32">
      {/* Hero background art — blended into the luxury black/gold theme */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          src="/ru-hero-bg.png"
          alt=""
          aria-hidden
          className="absolute inset-0 size-full scale-105 object-cover object-center"
        />
        {/* Darken for contrast, then fade the art into the page on every edge */}
        <div className="absolute inset-0 bg-ink-900/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-transparent to-ink-900" />
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-ink-900 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-ink-900 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-ink-900" />
        <div className="grid-backdrop absolute inset-0 opacity-20" />
      </div>
      {/* Ambient gold lighting (static gradient — no animation, no blur) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(45% 35% at 50% 0%, rgba(212,175,55,0.10), transparent 70%)",
        }}
      />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-3.5 py-1.5 text-[11px] font-medium text-gold sm:px-4 sm:text-xs"
          >
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold/60" />
              <span className="relative inline-flex size-2 rounded-full bg-gold" />
            </span>
            <span className="truncate sm:hidden">
              Premium Dota 2 boosting · worldwide
            </span>
            <span className="hidden sm:inline">
              Premium Dota 2 boosting — now serving players worldwide
            </span>
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

          {/* Updated worldwide subtitle — highly visible on desktop & mobile */}
          <motion.div
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mx-auto mt-6 max-w-2xl"
          >
            <p className="font-display text-xl font-semibold text-white sm:text-2xl">
              {t("hero.subtitle")}
            </p>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">
              Trusted by{" "}
              <span className="font-medium text-gold">Dota 2 Players Worldwide</span>
              {" "}— professional boosting available globally.
            </p>
          </motion.div>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/pricing-calculator">
                {t("cta.calculate")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="xl" className="w-full sm:w-auto">
              <Link href="/services">{t("cta.explore")}</Link>
            </Button>
          </motion.div>

          {/* First-order offer — elegant, applied automatically at checkout */}
          {firstOrderActive() && (
            <motion.div
              custom={4}
              variants={fade}
              initial="hidden"
              animate="show"
              className="mt-5 flex justify-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.07] px-4 py-2 text-sm font-medium text-gold">
                <Gift className="size-4" />
                First order: save {FIRST_ORDER.percent}% — applied automatically at
                checkout
              </span>
            </motion.div>
          )}

          {/* 🌍 Global trust badge — directly below the CTA */}
          <motion.div
            custom={4}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-7 flex justify-center"
          >
            <span className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white">
              <span aria-hidden className="text-base">🌍</span>
              <span className="text-gold">{t("hero.trusted")}</span>
            </span>
          </motion.div>

          <motion.div
            custom={5}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-6 flex justify-center"
          >
            <LiveActivity />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
