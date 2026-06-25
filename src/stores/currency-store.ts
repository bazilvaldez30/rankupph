import { create } from "zustand";
import { type CurrencyCode } from "@/lib/currency";

interface CurrencyState {
  currency: CurrencyCode;
  /** True once the user's stored/detected preference has loaded. */
  hydrated: boolean;
  setCurrency: (c: CurrencyCode) => void;
  hydrate: (c: CurrencyCode) => void;
}

function persist(c: CurrencyCode) {
  if (typeof document === "undefined") return;
  // 1 year, site-wide.
  document.cookie = `currency=${c}; path=/; max-age=31536000; SameSite=Lax`;
  try {
    localStorage.setItem("currency", c);
  } catch {
    /* ignore */
  }
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  // SSR/default — international-first. PH visitors are switched on hydrate().
  currency: "USD",
  hydrated: false,
  setCurrency: (currency) => {
    persist(currency);
    set({ currency });
  },
  hydrate: (currency) => set({ currency, hydrated: true }),
}));

export { persist as persistCurrency };
