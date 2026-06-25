"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignBoosterProps {
  orderId: string;
  boosters: { id: string; label: string }[];
  currentBoosterId: string | null;
  assignable: boolean;
}

export function AssignBooster({
  orderId,
  boosters,
  currentBoosterId,
  assignable,
}: AssignBoosterProps) {
  const router = useRouter();
  const [value, setValue] = useState(currentBoosterId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!assignable) {
    const current = boosters.find((b) => b.id === currentBoosterId);
    return (
      <span className="text-xs text-muted-foreground">
        {current ? current.label : "—"}
      </span>
    );
  }

  async function assign() {
    if (!value) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boosterId: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to assign.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="h-9 w-40 text-xs">
          <SelectValue placeholder="Select booster" />
        </SelectTrigger>
        <SelectContent>
          {boosters.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="secondary"
        onClick={assign}
        disabled={loading || !value || value === currentBoosterId}
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
        {currentBoosterId ? "Reassign" : "Assign"}
      </Button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
