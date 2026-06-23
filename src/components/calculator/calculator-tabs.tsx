"use client";

import { motion } from "framer-motion";
import { Crosshair, Swords, Target, Timer, Trophy } from "lucide-react";
import type { ServiceCategoryKey } from "@/lib/catalog-data";
import type { PublicService } from "@/lib/fallback-data";
import { cn } from "@/lib/utils";

const ICONS: Record<ServiceCategoryKey, typeof Swords> = {
  MMR_BOOSTING: Target,
  CALIBRATION: Crosshair,
  RANKED_WINS: Trophy,
  BATTLE_CUP: Swords,
  LOW_PRIORITY: Timer,
  COACHING: Swords,
};

interface CalculatorTabsProps {
  services: PublicService[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export function CalculatorTabs({
  services,
  activeSlug,
  onSelect,
}: CalculatorTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {services.map((s) => {
        const Icon = ICONS[s.category] ?? Swords;
        const active = s.slug === activeSlug;
        return (
          <button
            key={s.slug}
            type="button"
            onClick={() => onSelect(s.slug)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-gold/40 text-white"
                : "border-white/[0.06] text-muted-foreground hover:border-white/15 hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="calc-tab-bg"
                className="absolute inset-0 rounded-xl bg-gold/[0.08]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className={cn("relative size-4", active && "text-gold")} />
            <span className="relative whitespace-nowrap">{s.title}</span>
          </button>
        );
      })}
    </div>
  );
}
