"use client";

import { useEffect } from "react";

const REFERRAL_COOKIE_KEY = "mp_ref";
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] ?? "");
}

export function ReferralTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;

    const existingCookie = getCookieValue(REFERRAL_COOKIE_KEY);
    if (existingCookie) return;

    const expires = new Date(Date.now() + THIRTY_DAYS_IN_MS).toUTCString();
    document.cookie = `${REFERRAL_COOKIE_KEY}=${encodeURIComponent(ref)}; path=/; expires=${expires}`;
  }, []);

  return null;
}

