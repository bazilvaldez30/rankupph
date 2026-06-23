import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { features } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your RankUpPH account.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm googleEnabled={features.googleAuth} />
    </Suspense>
  );
}
