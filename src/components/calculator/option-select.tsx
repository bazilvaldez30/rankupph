"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCentavos } from "@/lib/format";
import { useT } from "@/hooks/use-translation";
import type { PublicServiceOption } from "@/lib/fallback-data";

interface OptionSelectProps {
  groupLabel: string;
  options: PublicServiceOption[];
  value: string;
  onChange: (value: string) => void;
}

function priceHint(o: PublicServiceOption): string {
  if (o.priceDelta && o.priceDelta > 0) return ` · ${formatCentavos(o.priceDelta)}`;
  if (o.priceMultiplier && o.priceMultiplier !== 10000) {
    return ` · +${Math.round((o.priceMultiplier / 10000 - 1) * 100)}%`;
  }
  return "";
}

export function OptionSelect({
  groupLabel,
  options,
  value,
  onChange,
}: OptionSelectProps) {
  const t = useT();
  const sorted = [...options].sort((a, b) => a.sortOrder - b.sortOrder);
  const groupKey = options[0]?.groupKey ?? "";
  return (
    <div className="space-y-2.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {t(`grp.${groupKey}`, groupLabel)}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sorted.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {t(`opt.${groupKey}.${o.value}`, o.label)}
              {priceHint(o)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
