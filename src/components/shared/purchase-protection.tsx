"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  CreditCard,
  Headphones,
  Lock,
  ShieldCheck,
  Undo2,
} from "lucide-react";

const ITEMS = [
  {
    icon: Lock,
    title: "Your account stays private",
    desc: "Boosters play through a region-matched VPN in offline mode — invisible to your friends, clubs, and recent teammates.",
  },
  {
    icon: Undo2,
    title: "Money-back guarantee",
    desc: "Every order is backed by our refund promise. If something doesn't go to plan, we make it right — no runaround.",
  },
  {
    icon: Headphones,
    title: "24/7 live support",
    desc: "Chat directly with your booster and reach a real person any hour. You're updated at every step, never left guessing.",
  },
  {
    icon: CreditCard,
    title: "Bank-grade encryption",
    desc: "Payments run through Stripe (PCI-DSS), and your Steam credentials are encrypted at rest with AES-256 — only your booster can see them.",
  },
];

export function PurchaseProtection({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-gold/20 backdrop-blur-xl"
      style={{
        background:
          "radial-gradient(120% 90% at 0% 0%, rgba(212,175,55,0.10), rgba(10,10,10,0.55) 45%)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-gold/10 text-gold">
          <ShieldCheck className="size-5" />
        </span>
        <span className="flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/80">
            RankUpPH Shield™
          </span>
          <span className="block font-display text-base font-semibold text-white">
            How we protect your purchase
          </span>
        </span>
        <ChevronDown
          className={`size-5 text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${open ? "rotate-180 text-gold" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.55, ease: [0.33, 1, 0.68, 1] },
              opacity: { duration: 0.45, ease: "easeInOut" },
            }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-gold/[0.12] px-4 py-5">
              {ITEMS.map((item) => (
                <div key={item.title} className="flex gap-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
