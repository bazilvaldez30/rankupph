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
import { useT } from "@/hooks/use-translation";

const ITEMS = [
  { icon: Lock, key: "pp.i1" },
  { icon: Undo2, key: "pp.i2" },
  { icon: Headphones, key: "pp.i3" },
  { icon: CreditCard, key: "pp.i4" },
];

export function PurchaseProtection({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const t = useT();
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
            {t("pp.title")}
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
                <div key={item.key} className="flex gap-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{t(`${item.key}.t`)}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {t(`${item.key}.d`)}
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
