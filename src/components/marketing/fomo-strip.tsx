import { Bolt, Rocket, ShieldCheck, Star, Users } from "lucide-react";
import { buildFomoSignals, type FomoSignal } from "@/lib/promo";
import { cn } from "@/lib/utils";

const ICONS = {
  shield: ShieldCheck,
  star: Star,
  bolt: Bolt,
  users: Users,
  rocket: Rocket,
} as const;

/**
 * Ethical FOMO strip — factual trust signals, with real numbers only when
 * provided (e.g. a verified rating from the DB). No fabricated statistics.
 */
export function FomoStrip({
  data,
  className,
}: {
  data?: { customers?: number | null; rating?: number | null };
  className?: string;
}) {
  const signals = buildFomoSignals(data);
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-3",
        className,
      )}
    >
      {signals.map((s: FomoSignal) => {
        const Icon = ICONS[s.icon];
        const text =
          s.value != null && s.template ? s.template(s.value) : s.label;
        return (
          <div
            key={s.key}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Icon className="size-4 text-gold" />
            {text}
          </div>
        );
      })}
    </div>
  );
}
