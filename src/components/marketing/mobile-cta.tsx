"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FIRST_ORDER, firstOrderActive } from "@/lib/promo";

/** Sticky bottom CTA shown on mobile after the user scrolls past the hero. */
export function MobileStickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-ink-900/90 p-4 backdrop-blur-xl transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {firstOrderActive() && (
        <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-gold">
          <Gift className="size-3.5" />
          First order: save {FIRST_ORDER.percent}% — applied at checkout
        </p>
      )}
      <Button asChild size="lg" className="w-full">
        <Link href="/pricing-calculator">
          Calculate Your Boost
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
