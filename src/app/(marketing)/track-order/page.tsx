import { Suspense } from "react";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { TrackOrderClient } from "@/components/orders/track-order-client";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track the status and progress of your RankUpPH order using your order number.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return (
    <div className="relative py-16 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/[0.06] blur-[120px]" />
      <div className="container relative">
        <SectionHeading
          eyebrow="Track Order"
          title={
            <>
              Where&apos;s my <span className="gold-text">climb?</span>
            </>
          }
          description="Enter your order number to see live status and progress. No sign-in required."
        />
        <div className="mt-12">
          <Suspense fallback={null}>
            <TrackOrderClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
