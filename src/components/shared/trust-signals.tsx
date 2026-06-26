import { Check } from "lucide-react";
import { TRUST_SIGNALS } from "@/lib/promo";
import { cn } from "@/lib/utils";

/**
 * Minimal, elegant trust checklist shown near checkout actions.
 * Factual statements only — no statistics.
 */
export function TrustSignals({
  className,
  items = TRUST_SIGNALS as readonly string[],
}: {
  className?: string;
  items?: readonly string[];
}) {
  return (
    <ul className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2", className)}>
      {items.map((label) => (
        <li
          key={label}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-gold/[0.12] text-gold">
            <Check className="size-3" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}
