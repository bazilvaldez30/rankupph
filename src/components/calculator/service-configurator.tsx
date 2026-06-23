"use client";

import { ArrowDown } from "lucide-react";
import type { PublicModifier, PublicRank, PublicService } from "@/lib/fallback-data";
import { useCalculatorStore } from "@/stores/calculator-store";
import { MmrSlider } from "./mmr-slider";
import { OptionSelect } from "./option-select";
import { QuantityStepper } from "./quantity-stepper";
import { BoostingModeSelector } from "./boosting-mode-selector";
import { ModifierToggles } from "./modifier-toggles";

const DUO_KEY = "DUO_QUEUE";

interface ServiceConfiguratorProps {
  service: PublicService;
  ranks: PublicRank[];
  modifiers: PublicModifier[];
}

/** Renders the category-appropriate input fields, wired to the calculator store. */
export function ServiceConfigurator({
  service,
  ranks,
  modifiers,
}: ServiceConfiguratorProps) {
  const {
    currentMmr,
    targetMmr,
    quantity,
    optionSelections,
    modifierKeys,
    setCurrentMmr,
    setTargetMmr,
    setQuantity,
    setOption,
    toggleModifier,
  } = useCalculatorStore();

  const duoModifier = modifiers.find((m) => m.key === DUO_KEY);
  const isDuo = modifierKeys.includes(DUO_KEY);

  const sortedRanks = [...ranks].sort((a, b) => a.order - b.order);
  const mmrMin = sortedRanks[0]?.minMmr ?? 0;
  const mmrMax = sortedRanks[sortedRanks.length - 1]?.maxMmr ?? 8000;

  // Group options by groupKey.
  const groups = new Map<string, { label: string; opts: typeof service.options }>();
  for (const o of service.options) {
    const g = groups.get(o.groupKey);
    if (g) g.opts.push(o);
    else groups.set(o.groupKey, { label: o.groupLabel, opts: [o] });
  }

  const isMmrRange = service.pricingMethod === "MMR_RANGE";
  const isPerUnit =
    service.pricingMethod === "PER_UNIT" || service.pricingMethod === "SESSION";
  const showCurrentMmr =
    service.category === "MMR_BOOSTING" ||
    service.category === "CALIBRATION" ||
    service.category === "RANKED_WINS";
  const currentLabel =
    service.category === "CALIBRATION" ? "Current Medal (MMR)" : "Current MMR";

  return (
    <div className="space-y-6">
      {/* MMR sliders */}
      {showCurrentMmr && (
        <div className="space-y-3">
          <MmrSlider
            label={currentLabel}
            value={currentMmr}
            min={mmrMin}
            max={mmrMax}
            ranks={ranks}
            onChange={setCurrentMmr}
          />
          {isMmrRange && (
            <>
              <div className="flex items-center justify-center">
                <span className="flex size-9 items-center justify-center rounded-full border border-gold/20 bg-gold/[0.06] text-gold">
                  <ArrowDown className="size-4" />
                </span>
              </div>
              <MmrSlider
                label="Target MMR"
                value={targetMmr}
                min={mmrMin}
                max={mmrMax}
                ranks={ranks}
                onChange={setTargetMmr}
              />
            </>
          )}
        </div>
      )}

      {/* Quantity (per-unit) */}
      {isPerUnit && service.unitLabel && (
        <QuantityStepper
          label={`Number of ${service.unitLabel}s`}
          value={quantity}
          min={service.minUnits}
          max={service.maxUnits}
          onChange={setQuantity}
        />
      )}

      {/* Option groups */}
      {[...groups.entries()].map(([groupKey, g]) => (
        <OptionSelect
          key={groupKey}
          groupLabel={g.label}
          options={g.opts}
          value={optionSelections[groupKey] ?? g.opts[0]?.value ?? ""}
          onChange={(v) => setOption(groupKey, v)}
        />
      ))}

      {/* Boosting mode */}
      <BoostingModeSelector
        duoModifier={duoModifier}
        isDuo={isDuo}
        onChange={(duo) => {
          if (duo !== isDuo) toggleModifier(DUO_KEY);
        }}
      />

      {/* Add-ons */}
      <ModifierToggles
        modifiers={modifiers}
        selected={modifierKeys}
        onToggle={toggleModifier}
      />
    </div>
  );
}
