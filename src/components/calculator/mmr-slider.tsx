"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { rankFromMmr } from "@/lib/pricing";
import type { PublicRank } from "@/lib/fallback-data";
import { RankMedal } from "./rank-medal";

interface MmrSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  ranks: PublicRank[];
  onChange: (n: number) => void;
}

export function MmrSlider({
  label,
  value,
  min,
  max,
  step = 10,
  ranks,
  onChange,
}: MmrSliderProps) {
  const rank = rankFromMmr(ranks, value);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <motion.span
          key={value}
          initial={{ opacity: 0.5, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-bold tabular-nums text-white"
        >
          {value.toLocaleString()}
          <span className="ml-1 text-sm font-normal text-muted-foreground">MMR</span>
        </motion.span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={rank?.order ?? "none"}
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 360, damping: 22 }}
          >
            <RankMedal name={rank?.name ?? "Archon"} iconUrl={rank?.iconUrl} size="md" />
          </motion.div>
        </AnimatePresence>
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={rank?.name ?? "none"}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="font-display text-lg font-semibold text-white"
            >
              {rank?.name ?? "—"}
            </motion.div>
          </AnimatePresence>
          <Slider
            value={[value]}
            min={min}
            max={max}
            step={step}
            onValueChange={(v) => onChange(v[0] ?? value)}
            className="mt-3"
            aria-label={label}
          />
        </div>
      </div>
    </div>
  );
}
