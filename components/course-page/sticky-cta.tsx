"use client";

import { useEffect, useState } from "react";

import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

/**
 * Mobile sticky call-to-action for programme pages. Appears once the visitor
 * has scrolled past the hero, so price and the next action stay one tap away.
 */
export function StickyCta({
  href = "#options",
  label,
  priceLabel,
  note,
}: {
  href?: string;
  label: string;
  priceLabel?: string;
  note?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-4 bg-[#0f2a28] px-5 py-3 shadow-[0_-10px_30px_-14px_rgba(0,40,38,0.6)]">
        <div className="min-w-0">
          {priceLabel ? (
            <div className="font-display leading-none text-[#f1ece0]">
              {priceLabel}
            </div>
          ) : null}
          {note ? (
            <div className="mt-1 text-[0.6rem] font-semibold tracking-[0.2em] text-[#f1ece0]/55 uppercase">
              {note}
            </div>
          ) : null}
        </div>
        <a
          href={href}
          onClick={() =>
            trackEvent(ANALYTICS_EVENTS.checkoutStarted, {
              source: "sticky-cta",
              label,
            })
          }
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f1ece0] px-5 py-2.5 text-sm font-medium text-[#0f2a28]"
        >
          {label}
          <span aria-hidden="true">›</span>
        </a>
      </div>
    </div>
  );
}
