"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicModifier, PublicRank, PublicService } from "@/lib/fallback-data";
import { rankFromMmr } from "@/lib/pricing";
import { useCalculatorStore } from "@/stores/calculator-store";
import { useQuote } from "@/hooks/use-quote";
import { CalculatorTabs } from "./calculator-tabs";
import { ServiceConfigurator } from "./service-configurator";
import { OrderSummary, type Progression, type SummaryLine } from "./order-summary";
import { MobileCheckoutBar } from "./mobile-checkout-bar";
import { FirstOrderBanner } from "@/components/marketing/first-order-banner";
import { DEFAULT_OFFER, firstOrderDiscount, type FirstOrderOffer } from "@/lib/promo";

const DUO_KEY = "DUO_QUEUE";

interface PricingCalculatorProps {
  services: PublicService[];
  ranks: PublicRank[];
  modifiers: PublicModifier[];
  initialSlug?: string;
  lockedSlug?: string;
  mode?: "full" | "preview";
  offer?: FirstOrderOffer;
}

export function PricingCalculator({
  services,
  ranks,
  modifiers,
  initialSlug,
  lockedSlug,
  mode = "full",
  offer = DEFAULT_OFFER,
}: PricingCalculatorProps) {
  const router = useRouter();
  const visible = lockedSlug ? services.filter((s) => s.slug === lockedSlug) : services;

  const [activeSlug, setActiveSlug] = useState(
    lockedSlug ?? initialSlug ?? visible[0]?.slug ?? "",
  );
  const activeService = visible.find((s) => s.slug === activeSlug) ?? visible[0];

  const {
    serviceSlug,
    currentMmr,
    targetMmr,
    quantity,
    optionSelections,
    modifierKeys,
    initService,
  } = useCalculatorStore();

  useEffect(() => {
    if (activeService) initService(activeService);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeService?.slug]);

  const ready = serviceSlug === activeService?.slug;
  const isMmrRange = activeService?.pricingMethod === "MMR_RANGE";
  const isPerUnit =
    activeService?.pricingMethod === "PER_UNIT" ||
    activeService?.pricingMethod === "SESSION";
  const showCurrentMmr =
    activeService?.category === "MMR_BOOSTING" ||
    activeService?.category === "CALIBRATION" ||
    activeService?.category === "RANKED_WINS";

  const { data: quote, isFetching } = useQuote({
    serviceSlug: activeService?.slug ?? "",
    currentMmr: showCurrentMmr ? currentMmr : undefined,
    targetMmr: isMmrRange ? targetMmr : undefined,
    quantity: isPerUnit ? quantity : undefined,
    optionSelections: ready ? optionSelections : {},
    modifierKeys: ready ? modifierKeys : [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progression = useMemo<Progression | null>(() => {
    if (!showCurrentMmr) return null;
    return {
      current: { rank: rankFromMmr(ranks, currentMmr), mmr: currentMmr },
      target: isMmrRange
        ? { rank: rankFromMmr(ranks, targetMmr), mmr: targetMmr }
        : null,
      diff: isMmrRange ? Math.max(0, targetMmr - currentMmr) : null,
    };
  }, [showCurrentMmr, isMmrRange, ranks, currentMmr, targetMmr]);

  const summaryLines = useMemo<SummaryLine[]>(() => {
    if (!activeService) return [];
    const lines: SummaryLine[] = [];
    if (isPerUnit && activeService.unitLabel) {
      lines.push({
        label: "Quantity",
        value: `${quantity} ${activeService.unitLabel}${quantity > 1 ? "s" : ""}`,
      });
    }
    const seen = new Set<string>();
    for (const o of activeService.options) {
      if (seen.has(o.groupKey)) continue;
      seen.add(o.groupKey);
      const opt = activeService.options.find(
        (x) => x.groupKey === o.groupKey && x.value === optionSelections[o.groupKey],
      );
      if (opt) lines.push({ label: o.groupLabel, value: opt.label });
    }
    lines.push({
      label: "Boosting Mode",
      value: modifierKeys.includes(DUO_KEY) ? "Duo Queue" : "Solo Boost",
    });
    return lines;
  }, [activeService, quantity, optionSelections, modifierKeys, isPerUnit]);

  async function handleCheckout() {
    if (!activeService) return;
    if (mode === "preview") {
      router.push(`/pricing-calculator?service=${activeService.slug}`);
      return;
    }
    if (!quote?.valid) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: activeService.slug,
          currentMmr: showCurrentMmr ? currentMmr : undefined,
          targetMmr: isMmrRange ? targetMmr : undefined,
          quantity: isPerUnit ? quantity : undefined,
          optionSelections,
          modifierKeys,
        }),
      });
      if (res.status === 401) {
        router.push(`/login?callbackUrl=/pricing-calculator?service=${activeService.slug}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not create your order.");
        return;
      }
      router.push(`/checkout/${data.order.orderNumber}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!activeService) return null;

  const showOffer = Boolean(offer.active && offer.eligible);
  const discount =
    showOffer && quote?.valid ? firstOrderDiscount(quote.total) : 0;

  return (
    <div className="space-y-6">
      {showOffer && <FirstOrderBanner offer={offer} />}

      {!lockedSlug && (
        <CalculatorTabs
          services={visible}
          activeSlug={activeService.slug}
          onSelect={setActiveSlug}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="min-w-0 glass rounded-3xl p-5 sm:p-8">
          <ServiceConfigurator
            service={activeService}
            ranks={ranks}
            modifiers={modifiers}
          />
        </div>

        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            service={activeService}
            quote={quote}
            loading={isFetching}
            progression={progression}
            summaryLines={summaryLines}
            onCheckout={handleCheckout}
            submitting={submitting}
            error={error}
            offer={offer}
          />
        </div>
      </div>

      {/* Compact sticky checkout bar on mobile (full page only — the homepage
          preview has its own sticky CTA). */}
      {mode === "full" && (
        <>
          <div className="h-20 lg:hidden" aria-hidden />
          <MobileCheckoutBar
            valid={Boolean(quote?.valid)}
            total={quote?.valid ? quote.total : 0}
            discount={discount}
            percent={offer.percent}
            submitting={submitting}
            onCheckout={handleCheckout}
          />
        </>
      )}
    </div>
  );
}
