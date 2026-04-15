"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MindPointsNavBadge } from "@/components/MindPointsNavBadge";

const AUTH_LOADING_FALLBACK_MS = 10_000;

/**
 * Navbar auth controls must not rely on Clerk `<Show>` alone: when Clerk cannot
 * initialize (wrong host for production keys, blocked dev HMR, etc.), `<Show>`
 * never renders children and the bar looks broken with no sign-in affordance.
 */
export function AuthNavbarActions() {
  const { isLoaded, isSignedIn } = useAuth();
  const [assumeSignedOut, setAssumeSignedOut] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      return;
    }
    const id = window.setTimeout(() => {
      setAssumeSignedOut(true);
    }, AUTH_LOADING_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [isLoaded]);

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return null;
  }

  if (!isLoaded && !assumeSignedOut) {
    return (
      <Button variant="ghost" size="sm" disabled className="cursor-wait">
        <span className="text-muted-foreground text-sm">Sign in…</span>
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <SignInButton mode="modal">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            Quick sign in
          </Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MindPointsNavBadge />
      <UserButton userProfileMode="navigation" userProfileUrl="/account" />
    </div>
  );
}
