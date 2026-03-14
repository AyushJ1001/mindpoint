"use client";

import {
  normalizeReferralCode,
  REFERRAL_ATTRIBUTION_WINDOW_MS,
  REFERRAL_COOKIE_KEY,
} from "@mindpoint/domain/referrals";
import { useEffect } from "react";

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
    const rawRef = params.get("ref");
    if (!rawRef) return;

    const ref = normalizeReferralCode(rawRef);
    if (!ref) {
      console.warn("Invalid referral code format, ignoring:", rawRef);
      return;
    }

    const existingCookie = getCookieValue(REFERRAL_COOKIE_KEY);
    if (existingCookie) return;

    const expires = new Date(
      Date.now() + REFERRAL_ATTRIBUTION_WINDOW_MS,
    ).toUTCString();
    const isSecure = window.location.protocol === "https:";
    const cookieValue = encodeURIComponent(ref);
    const cookieAttributes = [
      `${REFERRAL_COOKIE_KEY}=${cookieValue}`,
      "path=/",
      `expires=${expires}`,
      "SameSite=Lax",
      ...(isSecure ? ["Secure"] : []),
    ].join("; ");

    document.cookie = cookieAttributes;
  }, []);

  return null;
}
