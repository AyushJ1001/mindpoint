"use client";

import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";

const AUTH_TIMEOUT_MS = 10_000;

export function AdminConvexGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }
    const id = setTimeout(() => setTimedOut(true), AUTH_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [isLoading]);

  if (timedOut) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-600">
          Could not connect to backend. Please refresh the page.
        </p>
      </div>
    );
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-600">Authorizing admin session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
