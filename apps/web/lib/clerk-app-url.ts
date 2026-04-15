"use client";

import { useEffect, useState } from "react";

/**
 * Canonical browser origin for Clerk redirects on preview and multi-host deployments.
 * `NEXT_PUBLIC_SITE_URL` is often fixed to production; this tracks the actual tab origin.
 */
export function useClerkAppOrigin(): string | undefined {
  const [origin, setOrigin] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setOrigin(window.location.origin);
  }, []);

  return origin;
}
