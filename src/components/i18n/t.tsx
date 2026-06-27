"use client";

import { translate } from "@/lib/i18n";
import { useLocaleStore } from "@/stores/locale-store";

/**
 * Renders a translated string for the active locale. A tiny client island so
 * server components can stay on the server and still localize their text:
 *   <T k="sec.faq.eyebrow" />
 */
export function T({ k }: { k: string }) {
  const locale = useLocaleStore((s) => s.locale);
  return <>{translate(locale, k)}</>;
}
