"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function HomeAdminButton() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const canAccessAdmin = useQuery(
    api.adminManagers.isUserAdmin,
    isAuthenticated ? {} : "skip",
  );

  if (isLoading || !isAuthenticated || !canAccessAdmin) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
      <Link href="/admin">Admin</Link>
    </Button>
  );
}
