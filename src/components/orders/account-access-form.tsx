"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Info, Loader2, Lock, ShieldCheck } from "lucide-react";
import {
  credentialSchema,
  steamGuardValues,
  type CredentialInput,
} from "@/lib/validations/credentials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GUARD_LABELS: Record<(typeof steamGuardValues)[number], string> = {
  MOBILE: "Mobile Authenticator (Steam Guard app)",
  EMAIL: "Email code",
  DISABLED: "Disabled",
  NONE: "No Steam Guard",
};

interface AccountAccessFormProps {
  orderId: string;
  redirectTo: string;
  defaults?: Partial<CredentialInput>;
  submitLabel?: string;
}

export function AccountAccessForm({
  orderId,
  redirectTo,
  defaults,
  submitLabel = "Submit Account Access",
}: AccountAccessFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CredentialInput>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      steamUsername: defaults?.steamUsername ?? "",
      steamPassword: "",
      steamGuard: defaults?.steamGuard ?? "MOBILE",
      backupCodes: defaults?.backupCodes ?? "",
      notes: defaults?.notes ?? "",
    },
  });

  const guard = watch("steamGuard");

  async function onSubmit(values: CredentialInput) {
    setServerError(null);
    const res = await fetch(`/api/orders/${orderId}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setServerError(data?.error ?? "Could not save your account access.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-gold/15 bg-gold/[0.04] p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold" />
        <p className="text-sm text-muted-foreground">
          Your password and backup codes are <span className="text-foreground">encrypted at rest</span>{" "}
          (AES-256). Only your <span className="text-foreground">assigned booster</span> and an{" "}
          <span className="text-foreground">admin</span> can view them, and every access is audit-logged.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="steamUsername">Steam Username</Label>
        <Input id="steamUsername" autoComplete="off" {...register("steamUsername")} />
        {errors.steamUsername && (
          <p className="text-xs text-red-400">{errors.steamUsername.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="steamPassword">Steam Password</Label>
        <Input
          id="steamPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register("steamPassword")}
        />
        {errors.steamPassword && (
          <p className="text-xs text-red-400">{errors.steamPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Steam Guard Status</Label>
        <Select value={guard} onValueChange={(v) => setValue("steamGuard", v as CredentialInput["steamGuard"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {steamGuardValues.map((g) => (
              <SelectItem key={g} value={g}>
                {GUARD_LABELS[g]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="backupCodes">
          Steam Guard Backup Codes
          {guard === "MOBILE" && <span className="ml-1 text-gold">(required)</span>}
        </Label>
        <textarea
          id="backupCodes"
          rows={6}
          spellCheck={false}
          placeholder={"CODE123\nCODE456\nCODE789\n…"}
          className="flex w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
          {...register("backupCodes")}
        />
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          One code per line. If you use the mobile authenticator, your booster needs
          these to sign in — paste at least <span className="text-foreground">5</span>{" "}
          (10+ recommended). Generate them in Steam → Account → Manage Steam Guard.
        </p>
        {errors.backupCodes && (
          <p className="text-xs text-red-400">{errors.backupCodes.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes for your booster</Label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Anything the booster should know (preferred heroes, schedule, etc.)"
          className="flex w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
          {...register("notes")}
        />
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {serverError}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        {submitLabel}
      </Button>
    </form>
  );
}
