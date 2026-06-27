"use client";

import { Switch } from "@/components/ui/switch";
import { Price } from "@/components/shared/price";
import { useT } from "@/hooks/use-translation";
import type { PublicModifier } from "@/lib/fallback-data";

interface ModifierTogglesProps {
  modifiers: PublicModifier[];
  selected: string[];
  onToggle: (key: string) => void;
}

function ModifierHint({ m }: { m: PublicModifier }) {
  if (m.kind === "MULTIPLIER") {
    return <>+{Math.round((m.value / 10000 - 1) * 100)}%</>;
  }
  return (
    <>
      +<Price centavos={m.value} />
    </>
  );
}

/** Add-on toggles (excludes boosting-mode modifiers, which have their own UI). */
export function ModifierToggles({
  modifiers,
  selected,
  onToggle,
}: ModifierTogglesProps) {
  const t = useT();
  const addons = modifiers.filter((m) => !m.isBoostingMode);
  if (addons.length === 0) return null;
  return (
    <div className="space-y-2.5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {t("calc.extraOptions")}
      </p>
      {addons.map((m) => {
        const on = selected.includes(m.key);
        return (
          <div
            key={m.key}
            role="button"
            tabIndex={0}
            aria-pressed={on}
            onClick={() => onToggle(m.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(m.key);
              }
            }}
            className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
              on
                ? "border-gold/40 bg-gold/[0.06]"
                : "border-white/[0.07] bg-white/[0.02] hover:border-white/15"
            }`}
          >
            <div className="min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {t(`mod.${m.key}.label`, m.label)}
                </span>
                <span className="text-xs font-medium text-gold"><ModifierHint m={m} /></span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {t(`mod.${m.key}.desc`, m.description)}
              </p>
            </div>
            {/* Visual only — the whole card is the control. */}
            <Switch
              checked={on}
              tabIndex={-1}
              aria-hidden
              className="pointer-events-none"
            />
          </div>
        );
      })}
    </div>
  );
}
