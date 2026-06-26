"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: ReactNode;
  /** Tailwind classes for the desktop grid (applied at `md:` and up). */
  desktopClassName?: string;
  /** Per-item basis on mobile (how much of the viewport one card takes). */
  itemBasis?: string;
  /** Show prev/next arrows on mobile. */
  arrows?: boolean;
  className?: string;
}

/**
 * Mobile-first carousel: a CSS scroll-snap track on small screens (touch,
 * momentum, snap, hidden scrollbar) that becomes a normal grid on `md+`.
 * Pure CSS layout — the only JS is a passive scroll listener to drive the dots.
 */
export function Carousel({
  children,
  desktopClassName = "md:grid-cols-3",
  itemBasis = "basis-[82%] sm:basis-[46%]",
  arrows = false,
  className,
}: CarouselProps) {
  const items = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    const step = first.offsetWidth + 16; // item width + gap-4
    setActive(Math.round(el.scrollLeft / step));
  }, []);

  const scrollTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    const step = first.offsetWidth + 16;
    el.scrollTo({ left: step * i, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const count = items.length;
  const clamped = Math.min(Math.max(active, 0), count - 1);

  return (
    <div className={className}>
      <div
        ref={trackRef}
        className={cn(
          "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1",
          "md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0",
          desktopClassName,
        )}
      >
        {items.map((child, i) => (
          <div
            key={i}
            className={cn(
              "min-w-0 shrink-0 snap-start md:basis-auto",
              itemBasis,
            )}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Mobile controls — dots (+ optional arrows). Hidden on desktop. */}
      {count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 md:hidden">
          {arrows && (
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollTo(Math.max(clamped - 1, 0))}
              className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              disabled={clamped === 0}
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === clamped ? "w-5 bg-gold" : "w-1.5 bg-white/20",
                )}
              />
            ))}
          </div>
          {arrows && (
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollTo(Math.min(clamped + 1, count - 1))}
              className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              disabled={clamped === count - 1}
            >
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
