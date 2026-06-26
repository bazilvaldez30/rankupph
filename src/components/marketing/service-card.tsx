import Link from "next/link";
import { ArrowUpRight, Check, Crosshair, Swords, Target, Timer, Trophy } from "lucide-react";
import type { ServiceCategoryKey } from "@/lib/catalog-data";
import type { PublicService } from "@/lib/fallback-data";
import { Price } from "@/components/shared/price";

const ICONS: Record<ServiceCategoryKey, typeof Swords> = {
  MMR_BOOSTING: Target,
  CALIBRATION: Crosshair,
  RANKED_WINS: Trophy,
  BATTLE_CUP: Swords,
  LOW_PRIORITY: Timer,
  COACHING: Swords,
};

export function ServiceCard({ service }: { service: PublicService }) {
  const Icon = ICONS[service.category] ?? Swords;
  const priceSuffix =
    service.pricingMethod === "PER_UNIT" && service.unitLabel
      ? ` / ${service.unitLabel}`
      : "";
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-gold sm:p-7"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-gold/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-center justify-between">
        <span className="flex size-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.06] text-gold">
          <Icon className="size-6" />
        </span>
        <ArrowUpRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
      </div>

      <h3 className="relative mt-6 font-display text-xl font-semibold text-white">
        {service.title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
        {service.shortDescription}
      </p>

      <ul className="relative mt-6 space-y-2.5">
        {service.features.slice(0, 4).map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
            <Check className="size-4 shrink-0 text-gold" />
            {f}
          </li>
        ))}
      </ul>

      <div className="relative mt-7 flex items-end justify-between border-t border-white/[0.06] pt-5">
        <div>
          <span className="text-xs text-muted-foreground">Starting from</span>
          <div className="font-display text-2xl font-bold text-white">
            <Price centavos={service.basePrice} />
            <span className="text-sm font-normal text-muted-foreground">
              {priceSuffix}
            </span>
          </div>
        </div>
        <span className="text-sm font-medium text-gold opacity-0 transition-opacity group-hover:opacity-100">
          View details
        </span>
      </div>
    </Link>
  );
}
