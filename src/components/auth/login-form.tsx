"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "./google-button";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const [serverError, setServerError] = useState<string | null>(null);

  function roleHome(role?: string) {
    if (role === "ADMIN") return "/admin";
    if (role === "PROVIDER") return "/provider";
    return "/dashboard";
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const res = await signIn("credentials", {
      ...values,
      redirect: false,
    });
    if (res?.error) {
      setServerError("Invalid email or password.");
      return;
    }
    // Land each role in its own workspace; honor an explicit callbackUrl.
    const session = await getSession();
    router.push(callbackUrl ?? roleHome(session?.user?.role));
    router.refresh();
  }

  return (
    <div className="glass rounded-3xl p-8 sm:p-10">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your orders and track progress.
        </p>
      </div>

      {googleEnabled && (
        <>
          <GoogleButton callbackUrl={callbackUrl ?? "/dashboard"} label="Sign in with Google" />
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.07]" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-white/[0.07]" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {serverError}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-gold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
