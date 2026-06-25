"use client";

import { useCurrencyStore } from "@/stores/currency-store";
import { formatPrice } from "@/lib/currency";

/**
 * Reactive price. Reads PHP centavos and renders in the user's selected
 * currency — updates instantly everywhere when the currency changes.
 */
export function Price({
  centavos,
  className,
}: {
  centavos: number;
  className?: string;
}) {
  const currency = useCurrencyStore((s) => s.currency);
  return (
    <span className={className} suppressHydrationWarning>
      {formatPrice(centavos, currency)}
    </span>
  );
}
