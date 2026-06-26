import { Suspense } from "react";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { TrackOrderClient } from "@/components/orders/track-order-client";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track the status and progress of your RankUpPH order using your order number.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      <CinematicBackdrop image="/ancient-ruines.png" opacity={0.07} glow="top" />
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
