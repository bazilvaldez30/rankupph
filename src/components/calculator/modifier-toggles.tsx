"use client";

import { Switch } from "@/components/ui/switch";
import { formatCentavos } from "@/lib/format";
import type { PublicModifier } from "@/lib/fallback-data";

interface ModifierTogglesProps {
  modifiers: PublicModifier[];
  selected: string[];
  onToggle: (key: string) => void;
}

function modifierHint(m: PublicModifier): string {
  if (m.kind === "MULTIPLIER") return `+${Math.round((m.value / 10000 - 1) * 100)}%`;
  return `+${formatCentavos(m.value)}`;
}

/** Add-on toggles (excludes boosting-mode modifiers, which have their own UI). */
export function ModifierToggles({
  modifiers,
  selected,
  onToggle,
}: ModifierTogglesProps) {
  const addons = modifiers.filter((m) => !m.isBoostingMode);
  if (addons.length === 0) return null;
  return (
    <div className="space-y-2.5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Extra Options
      </p>
      {addons.map((m) => {
        const on = selected.includes(m.key);
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onToggle(m.key)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
              on
                ? "border-gold/40 bg-gold/[0.06]"
                : "border-white/[0.07] bg-white/[0.02] hover:border-white/15"
            }`}
          >
            <div className="min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{m.label}</span>
                <span className="text-xs font-medium text-gold">{modifierHint(m)}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {m.description}
              </p>
            </div>
            <Switch checked={on} onCheckedChange={() => onToggle(m.key)} />
          </button>
        );
      })}
    </div>
  );
}
