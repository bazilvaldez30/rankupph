import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { features } from "@/lib/env";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your RankUpPH account to start climbing.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterForm googleEnabled={features.googleAuth} />;
}
