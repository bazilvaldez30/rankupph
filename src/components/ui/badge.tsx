import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      tone: {
        neutral: "border-white/10 bg-white/[0.04] text-muted-foreground",
        info: "border-sky-400/20 bg-sky-400/10 text-sky-300",
        warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
        success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        danger: "border-red-400/20 bg-red-400/10 text-red-300",
        gold: "border-gold/30 bg-gold/10 text-gold",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
