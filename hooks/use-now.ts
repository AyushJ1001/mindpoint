"use client";

import { useEffect, useState } from "react";

/**
 * Hook that provides the current time, updating every minute.
 * Use this for offer countdowns to avoid multiple timers per page.
 */
export function useNow() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Update immediately on mount
    setNow(Date.now());

    // Update every minute
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  return now;
}

