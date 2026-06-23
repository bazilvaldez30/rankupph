import { Check } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { ORDER_STATUS_META, ORDER_TIMELINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CANCELLED: OrderStatus[] = ["CANCELLED", "REFUNDED"];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (CANCELLED.includes(status)) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5 text-sm text-red-300">
        This order was {ORDER_STATUS_META[status].label.toLowerCase()}.
      </div>
    );
  }

  const effective = status === "CLOSED" ? "CONFIRMED" : status;
  const currentIndex = ORDER_TIMELINE.indexOf(effective);

  return (
    <ol className="relative space-y-1">
      {ORDER_TIMELINE.map((stage, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const meta = ORDER_STATUS_META[stage];
        return (
          <li key={stage} className="flex gap-4">
            {/* Rail */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                  done && "border-gold/40 bg-gold/15 text-gold",
                  active && "border-gold bg-gold-gradient text-ink-900",
                  !done && !active && "border-white/10 bg-white/[0.02] text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="size-4" />
                ) : (
                  <span className="text-xs font-semibold">{i + 1}</span>
                )}
              </span>
              {i < ORDER_TIMELINE.length - 1 && (
                <span
                  className={cn(
                    "my-1 w-px flex-1 grow",
                    i < currentIndex ? "bg-gold/40" : "bg-white/10",
                  )}
                  style={{ minHeight: 28 }}
                />
              )}
            </div>
            {/* Label */}
            <div className={cn("pb-6", active ? "opacity-100" : done ? "opacity-90" : "opacity-50")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  active ? "text-gold" : "text-foreground",
                )}
              >
                {meta.label}
              </p>
              {active && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Current stage
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
