"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Revealed {
  steamUsername: string;
  steamPassword: string;
  steamGuard: string;
  backupCodes: string[];
  notes: string | null;
  submittedAt: string;
}

interface CredentialsPanelProps {
  orderId: string;
  submitted: boolean;
  canEdit: boolean;
  editHref?: string;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-muted-foreground transition-colors hover:text-gold"
      aria-label="Copy"
    >
      {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
    </button>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`truncate text-sm text-white ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
      <CopyButton value={value} />
    </div>
  );
}

export function CredentialsPanel({
  orderId,
  submitted,
  canEdit,
  editHref,
}: CredentialsPanelProps) {
  const [data, setData] = useState<Revealed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  async function reveal() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/credentials/reveal`);
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Could not load credentials.");
        return;
      }
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  if (!submitted) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
        <KeyRound className="mx-auto size-8 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-medium text-foreground">
          No account access submitted yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {canEdit
            ? "Submit your Steam access so a booster can start."
            : "The customer hasn't shared account access yet."}
        </p>
        {canEdit && editHref && (
          <Button asChild size="sm" className="mt-4">
            <Link href={editHref}>Submit access</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!data ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
          <ShieldAlert className="mx-auto size-8 text-gold" />
          <p className="mt-3 text-sm text-foreground">Credentials are encrypted</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Revealing is recorded in the audit log.
          </p>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <Button size="sm" className="mt-4" onClick={reveal} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
            Reveal credentials
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="Steam username" value={data.steamUsername} />
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Steam password</div>
              <div className="truncate font-mono text-sm text-white">
                {showPw ? data.steamPassword : "••••••••••••"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="text-muted-foreground hover:text-gold"
                aria-label={showPw ? "Hide" : "Show"}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
              <CopyButton value={data.steamPassword} />
            </div>
          </div>
          <Field label="Steam Guard" value={data.steamGuard} />

          {data.backupCodes.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Backup codes ({data.backupCodes.length})
                </span>
                <CopyButton value={data.backupCodes.join("\n")} />
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-xs text-foreground/90 sm:grid-cols-3">
                {data.backupCodes.map((c, i) => (
                  <span key={i} className="rounded bg-white/[0.03] px-2 py-1">{c}</span>
                ))}
              </div>
            </div>
          )}

          {data.notes && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="text-xs text-muted-foreground">Notes</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">{data.notes}</p>
            </div>
          )}
        </div>
      )}

      {canEdit && editHref && (
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link href={editHref}>Update access</Link>
        </Button>
      )}
    </div>
  );
}
