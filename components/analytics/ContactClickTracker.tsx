"use client";

import { useEffect } from "react";

import { contactChannelForHref, track } from "@/lib/analytics";

/**
 * One delegated listener for every WhatsApp, mailto and tel link on the site,
 * so contact links need no per-link wiring. Only the channel is sent, never
 * the href (which can carry a phone number, an address or prefilled text).
 */
export function ContactClickTracker() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const channel = contactChannelForHref(anchor.getAttribute("href"));
      if (channel) track("contact_click", { channel });
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}
