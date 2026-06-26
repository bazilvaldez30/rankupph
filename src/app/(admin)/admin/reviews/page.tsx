import Link from "next/link";
import { ArrowLeft, BadgeCheck, Star } from "lucide-react";
import { requirePageRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/shared/account-shell";
import { Badge } from "@/components/ui/badge";
import { ReviewModerationActions } from "@/components/admin/review-moderation-actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < rating ? "size-3.5 fill-gold text-gold" : "size-3.5 text-white/15"}
        />
      ))}
    </div>
  );
}

export default async function AdminReviewsPage() {
  const user = await requirePageRole(["ADMIN"], "/admin/reviews");

  const reviews = await prisma.review
    .findMany({
      orderBy: [{ isPublished: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        customer: { select: { name: true, email: true } },
        service: { select: { title: true } },
        order: { select: { orderNumber: true } },
      },
    })
    .catch(() => []);

  const pending = reviews.filter((r) => !r.isPublished);

  return (
    <AccountShell roleLabel="Admin" userName={user.name}>
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Overview
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Reviews</h1>
      <p className="mt-1 text-muted-foreground">
        Approve verified customer reviews. Only approved reviews appear publicly
        and in search structured data.
      </p>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-1.5 text-sm text-gold">
        {pending.length} awaiting approval
      </div>

      {reviews.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center text-sm text-muted-foreground">
          No reviews yet.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border p-5 ${
                r.isPublished ? "border-white/[0.06] bg-white/[0.02]" : "border-gold/15 bg-gold/[0.03]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <Stars rating={r.rating} />
                    {r.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                        <BadgeCheck className="size-3.5" /> Verified purchase
                      </span>
                    )}
                    <Badge tone={r.isPublished ? "success" : "warning"}>
                      {r.isPublished ? "Published" : "Pending"}
                    </Badge>
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-foreground/90">“{r.comment}”</p>
                  )}
                  {r.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.tags.map((t) => (
                        <span key={t} className="rounded-full border border-gold/20 bg-gold/[0.06] px-2 py-0.5 text-[11px] text-gold/90">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {r.customer.name ?? r.customer.email} · {r.service.title} ·{" "}
                    {r.order.orderNumber} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <ReviewModerationActions reviewId={r.id} published={r.isPublished} />
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
