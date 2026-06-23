"use client";

import { useQuery } from "@tanstack/react-query";
import type { QuoteResult } from "@/lib/pricing";

export interface ServiceQuote extends QuoteResult {
  estimatedDelivery: string;
}

export interface QuoteParams {
  serviceSlug: string;
  currentMmr?: number;
  targetMmr?: number;
  quantity?: number;
  optionSelections: Record<string, string>;
  modifierKeys: string[];
}

async function fetchQuote(params: QuoteParams): Promise<ServiceQuote> {
  const res = await fetch("/api/pricing/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to fetch quote");
  return res.json();
}

/**
 * Debounced, cached quote fetch. The server is the source of truth — we never
 * compute the charged price on the client.
 */
export function useQuote(params: QuoteParams) {
  return useQuery({
    queryKey: ["quote", params],
    queryFn: () => fetchQuote(params),
    enabled: Boolean(params.serviceSlug),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}
