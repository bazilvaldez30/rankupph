"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import type { PublicReview } from "@/lib/fallback-data";
import { countryFlag } from "@/lib/format";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < rating ? "size-4 fill-gold text-gold" : "size-4 text-white/15"}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <motion.figure
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl transition-colors hover:border-gold/30"
    >
      {/* hover glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-gold/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex size-11 items-center justify-center rounded-full bg-gold-gradient font-display text-base font-bold text-ink-900">
              {review.authorName.charAt(0).toUpperCase()}
            </span>
            <span className="absolute -bottom-1 -right-1 text-base leading-none">
              {countryFlag(review.country)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-white">
                {review.authorName}
              </span>
              {review.isVerified && (
                <BadgeCheck className="size-4 text-gold" aria-label="Verified order" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">{review.dateLabel}</span>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>

      <blockquote className="relative mt-5 flex-1 text-sm leading-relaxed text-foreground/85">
        “{review.comment}”
      </blockquote>

      {review.tags.length > 0 && (
        <div className="relative mt-5 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
          {review.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-gold/20 bg-gold/[0.06] px-2.5 py-1 text-[11px] font-medium text-gold/90"
            >
              {t}
            </span>
          ))}
          {review.isVerified && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300/90">
              <BadgeCheck className="size-3.5" />
              Verified Order
            </span>
          )}
        </div>
      )}
    </motion.figure>
  );
}
