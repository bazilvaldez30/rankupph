import { Star } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { ReviewCard } from "@/components/marketing/review-card";
import { Carousel } from "@/components/shared/carousel";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";
import type { PublicReview } from "@/lib/fallback-data";

export function ReviewsSection({ reviews }: { reviews: PublicReview[] }) {
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 5;

  return (
    <section id="reviews" className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <CinematicBackdrop image="/jungle.png" opacity={0.08} glow="center" />
      <div className="container relative">
        <SectionHeading
          eyebrow="Reviews"
          title={
            <>
              Loved by climbers <span className="gold-text">across the ranks.</span>
            </>
          }
          description="Real results from real players. Every review comes from a completed, verified order."
        />

        <Reveal className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full border border-gold/20 bg-gold/[0.06] px-5 py-2.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-gold text-gold" />
            ))}
          </div>
          <span className="text-sm font-medium text-white">
            {avg.toFixed(1)} / 5
          </span>
          <span className="text-sm text-muted-foreground">
            from verified orders
          </span>
        </Reveal>

        <Carousel className="mt-12" desktopClassName="md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={i % 3} className="h-full">
              <ReviewCard review={review} />
            </Reveal>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
