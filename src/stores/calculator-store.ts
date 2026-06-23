import { create } from "zustand";
import type { PublicService } from "@/lib/fallback-data";

/** Build the default option selection (one value per option group). */
export function defaultSelections(service: PublicService): Record<string, string> {
  const groups = new Map<string, string>();
  const sorted = [...service.options].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const o of sorted) {
    if (!groups.has(o.groupKey)) groups.set(o.groupKey, o.value);
    if (o.isDefault) groups.set(o.groupKey, o.value);
  }
  return Object.fromEntries(groups);
}

interface CalculatorState {
  serviceSlug: string;
  currentMmr: number;
  targetMmr: number;
  quantity: number;
  optionSelections: Record<string, string>;
  modifierKeys: string[];

  initService: (service: PublicService) => void;
  setCurrentMmr: (n: number) => void;
  setTargetMmr: (n: number) => void;
  setQuantity: (n: number) => void;
  setOption: (groupKey: string, value: string) => void;
  toggleModifier: (key: string) => void;
}

const DEFAULT_CURRENT = 3000; // Archon
const DEFAULT_TARGET = 4000; // Ancient

export const useCalculatorStore = create<CalculatorState>((set) => ({
  serviceSlug: "",
  currentMmr: DEFAULT_CURRENT,
  targetMmr: DEFAULT_TARGET,
  quantity: 3,
  optionSelections: {},
  modifierKeys: [],

  initService: (service) =>
    set({
      serviceSlug: service.slug,
      currentMmr: DEFAULT_CURRENT,
      targetMmr: DEFAULT_TARGET,
      quantity: Math.min(Math.max(3, service.minUnits), service.maxUnits),
      optionSelections: defaultSelections(service),
      modifierKeys: [],
    }),

  // Keep current strictly below target.
  setCurrentMmr: (n) =>
    set((s) => ({ currentMmr: n, targetMmr: Math.max(s.targetMmr, n + 100) })),
  setTargetMmr: (n) =>
    set((s) => ({ targetMmr: n, currentMmr: Math.min(s.currentMmr, n - 100) })),
  setQuantity: (quantity) => set({ quantity }),
  setOption: (groupKey, value) =>
    set((s) => ({ optionSelections: { ...s.optionSelections, [groupKey]: value } })),
  toggleModifier: (key) =>
    set((s) => ({
      modifierKeys: s.modifierKeys.includes(key)
        ? s.modifierKeys.filter((k) => k !== key)
        : [...s.modifierKeys, key],
    })),
}));
