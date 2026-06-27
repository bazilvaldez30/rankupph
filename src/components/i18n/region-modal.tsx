"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Globe, X } from "lucide-react";
import { LOCALES, type Locale } from "@/lib/i18n";
import { useLocaleStore } from "@/stores/locale-store";
import { useT } from "@/hooks/use-translation";
import { CURRENCIES, CURRENCY_CODES, type CurrencyCode } from "@/lib/currency";
import { useCurrencyStore } from "@/stores/currency-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Field({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="relative mt-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 pr-10 text-sm font-medium text-foreground transition-colors focus-visible:border-gold/40 focus-visible:outline-none"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

/**
 * Navbar trigger + "Language & Region" modal. Edits a draft of language +
 * currency and applies both on Save.
 */
export function RegionSelector({
  variant = "compact",
  className,
}: {
  variant?: "compact" | "block";
  className?: string;
}) {
  const t = useT();
  const { locale, setLocale } = useLocaleStore();
  const { currency, setCurrency } = useCurrencyStore();

  const [open, setOpen] = useState(false);
  const [draftLocale, setDraftLocale] = useState<Locale>(locale);
  const [draftCurrency, setDraftCurrency] = useState<CurrencyCode>(currency);

  function launch() {
    setDraftLocale(locale);
    setDraftCurrency(currency);
    setOpen(true);
  }

  function save() {
    setLocale(draftLocale);
    setCurrency(draftCurrency);
    setOpen(false);
  }

  const active = CURRENCIES[currency];

  return (
    <>
      <button
        type="button"
        onClick={launch}
        aria-label={t("region.title")}
        className={cn(
          variant === "compact"
            ? "inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-foreground/90 transition-colors hover:border-gold/30 hover:text-white"
            : "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground/90",
          className,
        )}
      >
        <Globe className="size-3.5 text-gold" />
        {active.symbol} {active.label}
        <ChevronDown className="size-3.5 opacity-60" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative w-full max-w-md rounded-3xl p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("common.cancel")}
                className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <X className="size-4" />
              </button>

              <h2 className="font-display text-2xl font-bold text-white">
                {t("region.title")}
              </h2>
              <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                {t("region.subtitle")}
              </p>

              <div className="mt-6 space-y-5">
                <Field
                  label={t("region.language")}
                  value={draftLocale}
                  onChange={(v) => setDraftLocale(v as Locale)}
                >
                  {LOCALES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-ink-700">
                      {l.label}
                    </option>
                  ))}
                </Field>

                <Field
                  label={t("region.currency")}
                  value={draftCurrency}
                  onChange={(v) => setDraftCurrency(v as CurrencyCode)}
                >
                  {CURRENCY_CODES.map((code) => {
                    const meta = CURRENCIES[code];
                    return (
                      <option key={code} value={code} className="bg-ink-700">
                        {meta.symbol} {code} — {meta.label}
                      </option>
                    );
                  })}
                </Field>
              </div>

              <p className="mt-4 text-[11px] leading-tight text-muted-foreground">
                {t("region.estimate")}
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={save}>{t("common.save")}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
