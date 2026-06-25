import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/shared/section-heading";
import { BoosterApplyForm } from "@/components/booster/booster-apply-form";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Become a Booster",
  description:
    "Apply to become a verified RankUpPH Dota 2 booster. Earn by helping players climb.",
};

export default async function BecomeBoosterPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/become-a-booster");

  const profile = await prisma.boosterProfile.findUnique({
    where: { userId: user.id },
  });

  const pending = profile?.status === "PENDING";
  const approved = profile?.status === "APPROVED";

  return (
    <div className="relative py-16 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/[0.06] blur-[120px]" />
      <div className="container relative max-w-2xl">
        <SectionHeading
          eyebrow="Careers"
          title={
            <>
              Boost with <span className="gold-text">RankUpPH.</span>
            </>
          }
          description="Verified Immortal players earn competitive payouts fulfilling orders. Apply once — get reviewed — start claiming orders."
        />

        <div className="mt-12 glass rounded-3xl p-6 sm:p-8">
          {approved ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="size-12 text-emerald-400" />
              <h3 className="mt-4 font-display text-xl font-semibold text-white">
                You&apos;re an approved booster
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Head to your workspace to claim available orders.
              </p>
            </div>
          ) : pending ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Clock className="size-12 text-amber-400" />
              <h3 className="mt-4 font-display text-xl font-semibold text-white">
                Application under review
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ll notify you once a decision is made. Thanks for your patience.
              </p>
              <Badge tone="warning" className="mt-3">
                Pending
              </Badge>
            </div>
          ) : (
            <>
              {profile?.status === "REJECTED" && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                  <XCircle className="size-4" /> A previous application wasn&apos;t
                  approved. You&apos;re welcome to apply again.
                </div>
              )}
              <BoosterApplyForm />
            </>
          )}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-gold" />
          All boosters are vetted for skill, reliability, and discretion.
        </p>
      </div>
    </div>
  );
}
