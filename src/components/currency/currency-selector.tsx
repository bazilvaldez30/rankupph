"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { CURRENCIES, CURRENCY_CODES } from "@/lib/currency";
import { useCurrencyStore } from "@/stores/currency-store";
import { cn } from "@/lib/utils";

export function CurrencySelector({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrencyStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = CURRENCIES[currency];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-foreground/90 transition-colors hover:border-gold/30 hover:text-white"
        aria-label="Change currency"
      >
        <Globe className="size-3.5 text-gold" />
        {active.symbol} {active.label}
        <ChevronDown className="size-3.5 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-xl border border-white/[0.1] bg-ink-700/95 shadow-glass backdrop-blur-xl">
          {CURRENCY_CODES.map((code) => {
            const meta = CURRENCIES[code];
            const isActive = code === currency;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setCurrency(code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.04]",
                  isActive ? "text-gold" : "text-foreground/90",
                )}
              >
                <span>
                  <span className="mr-1.5 font-medium">{meta.symbol}</span>
                  {meta.label}
                </span>
                {isActive && <Check className="size-4" />}
              </button>
            );
          })}
          <p className="border-t border-white/[0.06] px-4 py-2 text-[11px] leading-tight text-muted-foreground">
            Estimates only. Charged in ₱ PHP.
          </p>
        </div>
      )}
    </div>
  );
}
