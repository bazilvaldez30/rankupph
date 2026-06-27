"use client";

import { useCallback } from "react";
import { translate } from "@/lib/i18n";
import { useLocaleStore } from "@/stores/locale-store";

/** Returns a `t(key, fallback?)` translator bound to the active locale. */
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  return useCallback(
    (key: string, fallback?: string) => translate(locale, key, fallback),
    [locale],
  );
}
