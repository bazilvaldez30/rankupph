"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { useOrderChat, type ChatAttachment } from "@/hooks/use-order-chat";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: "Customer",
  PROVIDER: "Booster",
  ADMIN: "Admin",
};

export function OrderChat({
  orderId,
  uploadsEnabled,
}: {
  orderId: string;
  uploadsEnabled: boolean;
}) {
  const { messages, me, seenAt, typingFrom, realtime, loading, send, uploadImage, notifyTyping } =
    useOrderChat(orderId);

  const [text, setText] = useState("");
  const [pending, setPending] = useState<ChatAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typingFrom]);

  const lastMine = [...messages].reverse().find((m) => m.senderId === me?.id);
  const seen = seenAt && lastMine && seenAt >= lastMine.createdAt;

  async function handleSend() {
    if ((!text.trim() && pending.length === 0) || sending) return;
    setSending(true);
    try {
      await send(text.trim(), pending);
      setText("");
      setPending([]);
    } finally {
      setSending(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 6)) {
        const att = await uploadImage(file);
        setPending((p) => [...p, att]);
      }
    } catch {
      /* surfaced by disabled state */
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex h-[28rem] flex-col rounded-2xl border border-white/[0.06] bg-white/[0.01]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <span className="text-sm font-medium text-white">Order chat</span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", realtime ? "bg-emerald-400" : "bg-amber-400")} />
          {realtime ? "Live" : "Auto-refresh"}
        </span>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            No messages yet. Say hello 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === me?.id;
            return (
              <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                    mine
                      ? "bg-gold-gradient text-ink-900"
                      : "border border-white/[0.07] bg-white/[0.03] text-foreground",
                  )}
                >
                  {!mine && (
                    <div className="mb-0.5 text-[11px] font-medium opacity-70">
                      {m.senderName} · {ROLE_LABEL[m.senderRole] ?? m.senderRole}
                    </div>
                  )}
                  {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                  {m.attachments.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.attachments.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noreferrer">
                          <Image
                            src={a.url}
                            alt="attachment"
                            width={140}
                            height={140}
                            className="h-24 w-24 rounded-lg object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
                  {formatDateTime(m.createdAt)}
                </span>
              </div>
            );
          })
        )}
        {typingFrom && (
          <p className="text-xs italic text-muted-foreground">{typingFrom} is typing…</p>
        )}
        {seen && (
          <p className="text-right text-[10px] text-muted-foreground">Seen</p>
        )}
      </div>

      {/* pending attachments */}
      {pending.length > 0 && (
        <div className="flex gap-2 border-t border-white/[0.06] px-4 py-2">
          {pending.map((a, i) => (
            <div key={i} className="relative">
              <Image src={a.url} alt="" width={48} height={48} className="size-12 rounded object-cover" />
              <button
                type="button"
                onClick={() => setPending((p) => p.filter((_, j) => j !== i))}
                className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-ink-900 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* composer */}
      <div className="flex items-center gap-2 border-t border-white/[0.06] p-3">
        {uploadsEnabled && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-muted-foreground transition-colors hover:text-gold"
              aria-label="Attach image"
            >
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            </button>
          </>
        )}
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            notifyTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-gold/40 focus-visible:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || (!text.trim() && pending.length === 0)}
          className="flex size-10 items-center justify-center rounded-xl bg-gold-gradient text-ink-900 transition-opacity disabled:opacity-40"
          aria-label="Send"
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </div>
    </div>
  );
}
