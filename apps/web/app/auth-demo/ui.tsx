"use client";

import Link from "next/link";
import { SignInButton, SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthDemoClient() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <p className="text-muted-foreground text-sm">
        Clerk is not configured for this build (missing
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).
      </p>
    );
  }

  if (!isLoaded) {
    return <p className="text-muted-foreground text-sm">Loading auth…</p>;
  }

  if (!isSignedIn) {
    return (
      <div className="border-border bg-card space-y-4 rounded-lg border p-6 shadow-sm">
        <p className="text-sm">You are signed out on this host.</p>
        <SignInButton mode="modal">
          <Button>Open sign-in</Button>
        </SignInButton>
        <p className="text-muted-foreground text-xs">
          Or use the full page at{" "}
          <Link
            href="/sign-in"
            className="text-primary underline-offset-4 hover:underline"
          >
            /sign-in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card space-y-4 rounded-lg border p-6 shadow-sm">
      <p className="text-sm font-medium">Signed in</p>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs uppercase">User ID</dt>
          <dd className="font-mono text-xs break-all">{user?.id ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs uppercase">Email</dt>
          <dd>{user?.primaryEmailAddress?.emailAddress ?? "—"}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/account">Open account</Link>
        </Button>
        <SignOutButton>
          <Button variant="secondary" size="sm">
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
