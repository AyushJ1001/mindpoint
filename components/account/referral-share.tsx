"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

/**
 * The shareable referral link. The code is the signed-in user's Clerk id, which
 * is what the cookie attribution in `ReferralTracker` already reads from `?ref`.
 */
export function ReferralShare({ code }: { code: string }) {
  const [origin, setOrigin] = useState("https://www.themindpoint.org");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const link = `${origin}/?ref=${encodeURIComponent(code)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      trackEvent(ANALYTICS_EVENTS.referralLinkCopied, { code });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked; the field stays selectable.
    }
  };

  return (
    <div className="border-border bg-card rounded-2xl border p-6">
      <h3 className="font-display text-xl tracking-tight">
        Your referral link
      </h3>
      <p className="text-muted-foreground mt-1 text-sm">
        Share it anywhere. When a friend enrols in a course, you earn Mind
        Points on their first purchase.
      </p>
      <div className="border-border mt-4 flex items-center gap-2 rounded-xl border bg-white/60 p-2 pl-4">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Your referral link"
          className="text-foreground/80 min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
