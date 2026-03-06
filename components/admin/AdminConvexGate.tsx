"use client";

import { useState, useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const AUTH_TIMEOUT_MS = 10_000;

export function AdminConvexGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [timedOut, setTimedOut] = useState(false);
  const isAdmin = useQuery(
    api.adminManagers.isUserAdmin,
    isAuthenticated ? {} : "skip",
  );
  const isAdminQueryPending = isAuthenticated && isAdmin === undefined;

  useEffect(() => {
    if (!isLoading && !isAdminQueryPending) {
      setTimedOut(false);
      return;
    }
    const id = setTimeout(() => setTimedOut(true), AUTH_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [isLoading, isAdminQueryPending]);

  if (timedOut) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-600">
          Could not connect to backend. Please refresh the page.
        </p>
      </div>
    );
  }

  if (isLoading || (isAuthenticated && isAdmin === undefined)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-600">Authorizing admin session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-600">
          Admin session expired. Please refresh the page.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-600">
          Your account does not have permission to access the admin panel.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
