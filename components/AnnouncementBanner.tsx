"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";

const STORAGE_KEY = "tmp-announcement-dismissed-v1";

/**
 * Slim, dismissible site-wide announcement. Copy lives here so it is a
 * one-line change when the message moves on. Honest by default: it announces
 * the new look and points at the January cohort, without a price claim.
 */
export default function AnnouncementBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (pathname.startsWith("/lms")) return null;
  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage may be unavailable; the banner just returns next load.
    }
  };

  return (
    <div className="water-band border-border relative border-b border-dashed">
      <div className="container flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 pr-8 text-center text-[0.78rem]">
        <span className="text-primary text-[0.62rem] font-semibold tracking-[0.24em] uppercase">
          New look
        </span>
        <span className="text-foreground/80">
          The Mind Point has a fresh face — January 2027 cohorts are taking
          shape.
        </span>
        <Link
          href="/january-2027"
          className="text-primary inline-flex items-center gap-1 font-semibold"
        >
          See what&apos;s planned <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
