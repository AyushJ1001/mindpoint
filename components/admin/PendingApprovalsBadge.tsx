"use client";

import { Component, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/backend/api";

/**
 * The sidebar's pending-payment badge. It owns its query and its own error
 * boundary so a failing count can never blank the whole admin shell — which is
 * exactly what happened when this query lived in AdminSidebar.
 */
function Badge() {
  const pending = useQuery(
    api.adminEnrollments.countPendingPaymentVerifications,
    {},
  );

  if (!pending || pending <= 0) return null;

  return (
    <span className="bg-destructive text-destructive-foreground ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-semibold">
      {pending}
    </span>
  );
}

class BadgeBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Pending approvals badge failed:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function PendingApprovalsBadge() {
  return (
    <BadgeBoundary>
      <Badge />
    </BadgeBoundary>
  );
}
