"use client";

import { motion } from "framer-motion";
import { Check, Shield, Users } from "lucide-react";
import type { PublicModifier } from "@/lib/fallback-data";
import { useT } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface BoostingModeSelectorProps {
  duoModifier?: PublicModifier;
  isDuo: boolean;
  onChange: (duo: boolean) => void;
}

export function BoostingModeSelector({
  duoModifier,
  isDuo,
  onChange,
}: BoostingModeSelectorProps) {
  const t = useT();
  if (!duoModifier) return null;
  const pct = Math.round((duoModifier.value / 10000 - 1) * 100);

  const modes = [
    {
      duo: false,
      icon: Shield,
      title: t("mode.solo"),
      desc: t("mode.soloLong"),
      tag: t("mode.soloDesc"),
    },
    {
      duo: true,
      icon: Users,
      title: t("mode.duo"),
      desc: t("mode.duoLong"),
      tag: `+${pct}%`,
    },
  ];

  return (
    <div className="space-y-2.5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {t("mode.label")}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {modes.map((m) => {
          const active = m.duo === isDuo;
          return (
            <button
              key={m.title}
              type="button"
              onClick={() => onChange(m.duo)}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                active
                  ? "border-gold/50 bg-gold/[0.06]"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/20",
              )}
            >
              {active && (
                <motion.span
                  layoutId="boost-mode-check"
                  className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-gold-gradient text-ink-900"
                >
                  <Check className="size-3" />
                </motion.span>
              )}
              <m.icon
                className={cn("size-5", active ? "text-gold" : "text-muted-foreground")}
              />
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{m.title}</span>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    m.duo ? "text-gold" : "text-muted-foreground",
                  )}
                >
                  {m.tag}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {m.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
