"use client";

import { useEffect } from "react";

const REFERRAL_COOKIE_KEY = "mp_ref";
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_REF_LENGTH = 64;
// Pattern: alphanumeric, hyphens, underscores, dots
const REF_VALIDATION_PATTERN = /^[a-zA-Z0-9._-]+$/;

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] ?? "");
}

function validateRefValue(ref: string): boolean {
  if (!ref || ref.length === 0 || ref.length > MAX_REF_LENGTH) {
    return false;
  }
  return REF_VALIDATION_PATTERN.test(ref);
}

export function ReferralTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;

    // Validate the ref value before proceeding
    if (!validateRefValue(ref)) {
      console.warn("Invalid referral code format, ignoring:", ref);
      return;
    }

    const existingCookie = getCookieValue(REFERRAL_COOKIE_KEY);
    if (existingCookie) return;

    const expires = new Date(Date.now() + THIRTY_DAYS_IN_MS).toUTCString();
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

