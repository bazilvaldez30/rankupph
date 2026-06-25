"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Role } from "@prisma/client";

export interface ChatAttachment {
  id?: string;
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface ChatMessage {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  createdAt: string;
  attachments: ChatAttachment[];
}

interface ChatState {
  messages: ChatMessage[];
  seenAt: string | null;
  me: { id: string; role: Role } | null;
  typingFrom: string | null;
  realtime: boolean;
  loading: boolean;
}

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap1";

export function useOrderChat(orderId: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    seenAt: null,
    me: null,
    typingFrom: null,
    realtime: false,
    loading: true,
  });
  const idsRef = useRef<Set<string>>(new Set());
  const channelRef = useRef<{ trigger: (e: string, d: unknown) => void } | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mergeMessages = useCallback((incoming: ChatMessage[]) => {
    setState((s) => {
      const next = [...s.messages];
      for (const m of incoming) {
        if (!idsRef.current.has(m.id)) {
          idsRef.current.add(m.id);
          next.push(m);
        }
      }
      next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      return { ...s, messages: next };
    });
  }, []);

  const load = useCallback(async () => {
    // no-store so polling/refresh always reads the latest, never a cached list.
    const res = await fetch(`/api/orders/${orderId}/chat`, { cache: "no-store" });
    if (!res.ok) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    const data = await res.json();
    idsRef.current = new Set(data.messages.map((m: ChatMessage) => m.id));
    setState((s) => ({
      ...s,
      messages: data.messages,
      seenAt: data.seenAt,
      me: data.me,
      loading: false,
    }));
  }, [orderId]);

  // Initial load
  useEffect(() => {
    void load();
  }, [load]);

  // Realtime via Pusher, with polling as a safety net. We keep polling until the
  // private-channel subscription is *confirmed*, then switch to pure realtime —
  // and fall back to polling if the subscription errors. This guarantees new
  // messages always appear without a manual refresh.
  useEffect(() => {
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | null = null;
    let cleanup: (() => void) | null = null;

    const startPoll = () => {
      if (!poll) poll = setInterval(() => void load(), 5000);
    };
    const stopPoll = () => {
      if (poll) {
        clearInterval(poll);
        poll = null;
      }
    };

    // Poll by default; Pusher replaces it once confirmed live.
    startPoll();

    async function setup() {
      if (!PUSHER_KEY) return; // no realtime configured → polling stays on
      const PusherClient = (await import("pusher-js")).default;
      if (cancelled) return;
      const client = new PusherClient(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        authEndpoint: "/api/pusher/auth",
      });
      const channelName = `private-order-${orderId}`;
      const channel = client.subscribe(channelName);
      channelRef.current = channel as unknown as { trigger: (e: string, d: unknown) => void };

      channel.bind("pusher:subscription_succeeded", () => {
        stopPoll();
        setState((s) => ({ ...s, realtime: true }));
      });
      channel.bind("pusher:subscription_error", () => {
        startPoll(); // realtime unavailable → keep polling
        setState((s) => ({ ...s, realtime: false }));
      });
      channel.bind("message:new", (m: ChatMessage) => mergeMessages([m]));
      channel.bind("message:read", (d: { userId: string; at: string }) =>
        setState((s) => (s.me && d.userId !== s.me.id ? { ...s, seenAt: d.at } : s)),
      );
      channel.bind("client-typing", (d: { userId: string; name: string }) => {
        setState((s) => (s.me && d.userId !== s.me.id ? { ...s, typingFrom: d.name } : s));
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(
          () => setState((s) => ({ ...s, typingFrom: null })),
          2500,
        );
      });

      cleanup = () => {
        channel.unbind_all();
        client.unsubscribe(channelName);
        client.disconnect();
        channelRef.current = null;
      };
    }
    void setup();

    return () => {
      cancelled = true;
      stopPoll();
      if (cleanup) cleanup();
    };
  }, [orderId, load, mergeMessages]);

  const send = useCallback(
    async (body: string, attachments: ChatAttachment[] = []) => {
      const res = await fetch(`/api/orders/${orderId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ body, attachments }),
      });
      if (!res.ok) throw new Error("send failed");
      const data = await res.json();
      mergeMessages([data.message]); // show instantly
      void load(); // reconcile with the authoritative server list (bulletproof)
    },
    [orderId, mergeMessages, load],
  );

  const uploadImage = useCallback(
    async (file: File): Promise<ChatAttachment> => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "upload failed");
      return { url: data.url, width: data.width, height: data.height };
    },
    [],
  );

  const notifyTyping = useCallback(() => {
    const ch = channelRef.current;
    if (ch && state.me) {
      try {
        ch.trigger("client-typing", { userId: state.me.id, name: "Someone" });
      } catch {
        /* client events may be disabled — ignore */
      }
    }
  }, [state.me]);

  return { ...state, send, uploadImage, notifyTyping, reload: load };
}
