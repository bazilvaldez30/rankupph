"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserRoleActions({
  userId,
  role,
}: {
  userId: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-gold" /> Admin
      </span>
    );
  }

  const next = role === "PROVIDER" ? "CUSTOMER" : "PROVIDER";

  async function change() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not update role.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <Button
        size="sm"
        variant={role === "PROVIDER" ? "secondary" : "default"}
        onClick={change}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : role === "PROVIDER" ? (
          <UserMinus className="size-3.5" />
        ) : (
          <UserPlus className="size-3.5" />
        )}
        {role === "PROVIDER" ? "Revert to customer" : "Make booster"}
      </Button>
      {error && <span className="max-w-[16rem] text-right text-xs text-red-400">{error}</span>}
    </div>
  );
}
