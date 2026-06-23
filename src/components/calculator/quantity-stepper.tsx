"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface QuantityStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}

export function QuantityStepper({
  label,
  value,
  min,
  max,
  onChange,
}: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="space-y-2.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label="Decrease"
        >
          <Minus className="size-4" />
        </Button>
        <span className="flex-1 text-center font-display text-2xl font-bold tabular-nums text-white">
          {value}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label="Increase"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
