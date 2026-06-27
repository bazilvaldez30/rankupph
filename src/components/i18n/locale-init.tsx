"use client";

import { useEffect } from "react";
import { isLocale, type Locale } from "@/lib/i18n";
import { persistLocale, useLocaleStore } from "@/stores/locale-store";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

/** Resolves the visitor's language once on mount: stored preference, else a
 *  best-effort guess from the browser language. Renders nothing. */
export function LocaleInit() {
  const hydrate = useLocaleStore((s) => s.hydrate);

  useEffect(() => {
    const stored =
      (typeof localStorage !== "undefined" && localStorage.getItem("locale")) ||
      readCookie("locale");
    if (isLocale(stored)) {
      hydrate(stored);
      return;
    }

    const lang = (navigator.language ?? "en").slice(0, 2).toLowerCase();
    const map: Record<string, Locale> = {
      zh: "zh",
      es: "es",
      pt: "pt",
      ru: "ru",
      tl: "fil",
    };
    const detected: Locale = map[lang] ?? "en";
    hydrate(detected);
    persistLocale(detected);
  }, [hydrate]);

  return null;
}
