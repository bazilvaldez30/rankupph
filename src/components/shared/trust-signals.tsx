import { Check } from "lucide-react";
import { T } from "@/components/i18n/t";
import { cn } from "@/lib/utils";

const DEFAULT_KEYS = [
  "trustsig.secure",
  "trustsig.methods",
  "trustsig.tracking",
  "trustsig.boosters",
  "trustsig.support",
];

/**
 * Minimal, elegant trust checklist shown near checkout actions.
 * Factual statements only — no statistics.
 */
export function TrustSignals({
  className,
  items = DEFAULT_KEYS,
}: {
  className?: string;
  items?: readonly string[];
}) {
  return (
    <ul className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2", className)}>
      {items.map((key) => (
        <li
          key={key}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-gold/[0.12] text-gold">
            <Check className="size-3" />
          </span>
          <T k={key} />
        </li>
      ))}
    </ul>
  );
}
