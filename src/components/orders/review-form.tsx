"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { REVIEW_TAGS } from "@/lib/validations/review";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReviewForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggleTag(t: string) {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : prev.length < 4 ? [...prev, t] : prev,
    );
  }

  async function submit() {
    if (rating < 1) {
      setError("Pick a star rating first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim(), tags }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not submit your review.");
        return;
      }
      setDone(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <CheckCircle2 className="size-9 text-emerald-400" />
        <p className="mt-3 text-sm font-medium text-foreground">Thanks for your review!</p>
        <p className="mt-1 text-xs text-muted-foreground">
          It&apos;ll appear publicly once our team approves it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                (hover || rating) >= n ? "fill-gold text-gold" : "text-white/20",
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Tell others how it went (optional)…"
        className="flex w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-gold/40 focus-visible:outline-none"
      />

      <div className="flex flex-wrap gap-2">
        {REVIEW_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => toggleTag(t)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              tags.includes(t)
                ? "border-gold/40 bg-gold/[0.08] text-gold"
                : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button onClick={submit} disabled={loading} className="w-full sm:w-auto">
        {loading && <Loader2 className="size-4 animate-spin" />}
        Submit review
      </Button>
    </div>
  );
}
