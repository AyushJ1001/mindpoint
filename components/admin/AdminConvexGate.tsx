"use client";

import { useConvexAuth } from "convex/react";

export function AdminConvexGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-600">Authorizing admin session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
