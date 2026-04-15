"use client";

import { useEffect, useState } from "react";
import { SignIn, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CLERK_LOAD_TIMEOUT_MS = 12_000;

export function SignInClient() {
  const { isLoaded } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      return;
    }
    const id = window.setTimeout(
      () => setTimedOut(true),
      CLERK_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(id);
  }, [isLoaded]);

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <p className="text-muted-foreground text-center text-sm">
        Sign-in is not configured for this deployment.
      </p>
    );
  }

  if (!isLoaded && timedOut) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="text-muted-foreground text-sm">
          The sign-in form did not load. This usually means Clerk rejected this
          host (for example production keys only allow your production domain)
          or the browser blocked dev scripts. Add this exact origin in the Clerk
          dashboard under authorized domains / redirect URLs, then reload.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  return <SignIn routing="path" path="/sign-in" />;
}
