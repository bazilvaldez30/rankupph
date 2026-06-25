"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormValues {
  displayName: string;
  rankAchieved: string;
  bio: string;
}

export function BoosterApplyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError(null);
    const res = await fetch("/api/booster/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not submit your application.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <Trophy className="size-12 text-gold" />
        <h3 className="mt-4 font-display text-xl font-semibold text-white">
          Application submitted
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team will review your application and notify you. Thanks for your
          interest in boosting with RankUpPH.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input id="displayName" placeholder="e.g. Phantom" {...register("displayName", { required: "Required" })} />
        {errors.displayName && <p className="text-xs text-red-400">{errors.displayName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="rankAchieved">Peak Rank / MMR</Label>
        <Input id="rankAchieved" placeholder="e.g. Immortal · 7200 MMR" {...register("rankAchieved", { required: "Required" })} />
        {errors.rankAchieved && <p className="text-xs text-red-400">{errors.rankAchieved.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">About you</Label>
        <textarea
          id="bio"
          rows={4}
          placeholder="Roles, hero pool, experience, availability…"
          className="flex w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-gold/40 focus-visible:outline-none"
          {...register("bio")}
        />
      </div>
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Submit Application
      </Button>
    </form>
  );
}
