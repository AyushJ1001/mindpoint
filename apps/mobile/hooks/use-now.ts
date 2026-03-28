import { useState, useEffect } from "react";

/**
 * Hook that returns the current timestamp, updating every `intervalMs`.
 * Used to trigger re-renders for time-sensitive UI (countdowns, offers).
 */
export function useNow(intervalMs = 60000): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
