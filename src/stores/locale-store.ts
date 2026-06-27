import { create } from "zustand";
import { type Locale } from "@/lib/i18n";

interface LocaleState {
  locale: Locale;
  hydrated: boolean;
  setLocale: (l: Locale) => void;
  hydrate: (l: Locale) => void;
}

function persist(l: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `locale=${l}; path=/; max-age=31536000; SameSite=Lax`;
  try {
    localStorage.setItem("locale", l);
  } catch {
    /* ignore */
  }
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "en",
  hydrated: false,
  setLocale: (locale) => {
    persist(locale);
    set({ locale });
  },
  hydrate: (locale) => set({ locale, hydrated: true }),
}));

export { persist as persistLocale };
