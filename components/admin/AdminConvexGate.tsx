"use client";

import { useState, useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const AUTH_TIMEOUT_MS = 10_000;
const ADMIN_CACHE_KEY = "admin-convex-gate:is-admin";
const ADMIN_CACHE_TTL_MS = 30_000;

export function AdminConvexGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [timedOut, setTimedOut] = useState(false);
  const [cachedIsAdmin, setCachedIsAdmin] = useState<boolean | null>(null);
  const [hasLoadedCache, setHasLoadedCache] = useState(false);
  const shouldQueryAdmin =
    isAuthenticated && (!hasLoadedCache || cachedIsAdmin === null);
  const isAdmin = useQuery(
    api.adminManagers.isUserAdmin,
    shouldQueryAdmin ? {} : "skip",
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!isAuthenticated) {
      window.sessionStorage.removeItem(ADMIN_CACHE_KEY);
      setCachedIsAdmin(null);
      setHasLoadedCache(true);
      return;
    }

    const raw = window.sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (!raw) {
      setCachedIsAdmin(null);
      setHasLoadedCache(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        value: boolean;
        expiresAt: number;
      };

      if (parsed.expiresAt <= Date.now()) {
        window.sessionStorage.removeItem(ADMIN_CACHE_KEY);
        setCachedIsAdmin(null);
      } else {
        setCachedIsAdmin(parsed.value);
      }
    } catch {
      window.sessionStorage.removeItem(ADMIN_CACHE_KEY);
      setCachedIsAdmin(null);
    }

    setHasLoadedCache(true);
  }, [isAuthenticated]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !isAuthenticated ||
      isAdmin === undefined
    ) {
      return;
    }

    setCachedIsAdmin(isAdmin);
    window.sessionStorage.setItem(
      ADMIN_CACHE_KEY,
      JSON.stringify({
        value: isAdmin,
        expiresAt: Date.now() + ADMIN_CACHE_TTL_MS,
      }),
    );
  }, [isAuthenticated, isAdmin]);

  const resolvedIsAdmin = cachedIsAdmin ?? isAdmin;

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

  if (
    isLoading ||
    (isAuthenticated && !hasLoadedCache) ||
    (shouldQueryAdmin && isAdmin === undefined)
  ) {
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

  if (!resolvedIsAdmin) {
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
