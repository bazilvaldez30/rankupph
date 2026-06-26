"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Gift, X } from "lucide-react";
import { FIRST_ORDER, firstOrderActive } from "@/lib/promo";
import { Button } from "@/components/ui/button";

const SEEN_KEY = "rup_exit_intent_seen";

/**
 * Tasteful desktop-only exit-intent prompt. Fires once per visitor when the
 * cursor leaves toward the top of the window. No countdowns, no fake urgency —
 * just a reminder of the real first-order offer.
 */
export function ExitIntent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!firstOrderActive()) return;
    // Desktop + fine pointer only.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {
      return;
    }

    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setOpen(true);
        try {
          localStorage.setItem(SEEN_KEY, "1");
        } catch {
          /* ignore */
        }
        document.removeEventListener("mouseout", onLeave);
      }
    };
    // Small delay so it never fires on initial load.
    const t = window.setTimeout(() => {
      document.addEventListener("mouseout", onLeave);
    }, 4000);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] hidden items-center justify-center p-6 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative w-full max-w-md overflow-hidden rounded-3xl p-8 text-center"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gold/10 blur-3xl" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <span className="relative mx-auto flex size-14 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.08] text-gold">
              <Gift className="size-7" />
            </span>
            <h2 className="relative mt-5 font-display text-2xl font-bold text-white">
              Before you go…
            </h2>
            <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
              Claim your first-order discount today — save{" "}
              <span className="font-semibold text-gold">{FIRST_ORDER.percent}%</span>{" "}
              on your first boost, applied automatically at checkout.
            </p>

            <div className="relative mt-7 flex flex-col gap-2.5">
              <Button asChild size="lg" className="w-full">
                <Link href="/pricing-calculator" onClick={() => setOpen(false)}>
                  Start My Order
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Continue Browsing
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
