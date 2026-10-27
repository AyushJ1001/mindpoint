"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ANALYTICS_CONSENT_EVENT,
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type ConsentDecision,
} from "@/lib/consent";

/**
 * A quiet consent bar. It appears once, after hydration, only when the visitor
 * has not chosen yet, and disappears for good once they do. Nothing is loaded
 * before the choice: see components/AnalyticsScripts.tsx.
 */
export default function ConsentBanner() {
  const [decision, setDecision] = useState<ConsentDecision | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDecision(readAnalyticsConsent());

    const onChange = (event: Event) => {
      const next = (event as CustomEvent<ConsentDecision>).detail;
      setDecision(next);
    };
    window.addEventListener(ANALYTICS_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, onChange);
  }, []);

  if (!mounted || decision !== null) return null;

  const choose = (next: ConsentDecision) => {
    writeAnalyticsConsent(next);
    setDecision(next);
  };

  return (
    <div
      role="dialog"
      aria-label="Analytics preference"
      aria-live="polite"
      className="border-border bg-background/95 fixed inset-x-4 bottom-4 z-50 rounded border p-4 shadow-[0_24px_60px_-30px_rgba(19,46,43,0.55)] backdrop-blur sm:left-auto sm:max-w-md"
    >
      <p className="text-sm leading-relaxed">
        We use Google Analytics and Microsoft Clarity to see which pages help
        students find the right course. Nothing loads unless you allow it, and
        we never send course content, written answers or payment details.{" "}
        <Link href="/privacy" className="text-primary underline underline-offset-4">
          Privacy notice
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => choose("granted")}
          className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium"
        >
          Allow analytics
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="border-border hover:border-primary rounded border px-4 py-2 text-sm"
        >
          Only essential
        </button>
      </div>
    </div>
  );
}
