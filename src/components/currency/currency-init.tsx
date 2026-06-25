"use client";

import { useEffect } from "react";
import { isCurrencyCode } from "@/lib/currency";
import { persistCurrency, useCurrencyStore } from "@/stores/currency-store";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

/**
 * Resolves the user's currency once on mount: stored preference (localStorage →
 * cookie), else a country guess (Philippines → PHP, everyone else → USD).
 * Renders nothing.
 */
export function CurrencyInit() {
  const hydrate = useCurrencyStore((s) => s.hydrate);

  useEffect(() => {
    const stored =
      (typeof localStorage !== "undefined" && localStorage.getItem("currency")) ||
      readCookie("currency");

    if (isCurrencyCode(stored)) {
      hydrate(stored);
      return;
    }

    // Lightweight default detection: PH timezone → PHP, otherwise USD.
    let detected: "PHP" | "USD" = "USD";
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
      if (tz === "Asia/Manila") detected = "PHP";
    } catch {
      /* keep USD */
    }
    hydrate(detected);
    persistCurrency(detected);
  }, [hydrate]);

  return null;
}
