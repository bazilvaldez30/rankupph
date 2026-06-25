"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Copy, ImagePlus, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GCashPaymentProps {
  orderNumber: string;
  amountLabel: string;
  gcashNumber: string;
  gcashName: string;
  uploadsEnabled: boolean;
}

export function GCashPayment({
  orderNumber,
  amountLabel,
  gcashNumber,
  gcashName,
  uploadsEnabled,
}: GCashPaymentProps) {
  const [reference, setReference] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Upload failed.");
        return;
      }
      setScreenshotUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (reference.trim().length < 3) {
      setError("Enter the GCash reference number from your receipt.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/gcash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          reference: reference.trim(),
          screenshotUrl: screenshotUrl ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not submit your payment.");
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <CheckCircle2 className="size-12 text-emerald-400" />
        <h3 className="mt-4 font-display text-lg font-semibold text-white">
          Payment submitted
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;re verifying your GCash payment. Your order is confirmed once an
          admin approves it — usually within minutes.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href={`/track-order?number=${orderNumber}`}>Track your order</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Smartphone className="size-4 text-gold" /> Send {amountLabel} via GCash
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Number</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(gcashNumber.replace(/\s/g, ""))}
              className="inline-flex items-center gap-1.5 font-medium text-white hover:text-gold"
            >
              {gcashNumber} <Copy className="size-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Account name</span>
            <span className="font-medium text-white">{gcashName}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Send the exact amount, then enter your reference number below.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">GCash Reference Number</Label>
        <Input
          id="reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g. 1234567890123"
        />
      </div>

      {uploadsEnabled && (
        <div className="space-y-2">
          <Label>Payment Screenshot (optional)</Label>
          {screenshotUrl ? (
            <div className="flex items-center gap-3">
              <Image src={screenshotUrl} alt="receipt" width={56} height={56} className="size-14 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setScreenshotUrl(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Replace
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-4 text-sm text-muted-foreground hover:border-gold/30">
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              Upload receipt
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              />
            </label>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}

      <Button size="lg" className="w-full" onClick={submit} disabled={submitting}>
        {submitting && <Loader2 className="size-4 animate-spin" />}
        Submit GCash Payment
      </Button>
    </div>
  );
}
