"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMindPoints } from "@/contexts/MindPointsContext";

export function MindPointsNavBadge() {
  const { pointsData, isLoading } = useMindPoints();

  if (isLoading || pointsData === undefined) {
    return null;
  }

  const balance = pointsData.balance || 0;

  return (
    <Link href="/account?tab=points">
      <Button
        variant="outline"
        size="sm"
        className="transition-smooth hover:bg-accent/50 cursor-pointer"
      >
        <Gift className="mr-2 h-4 w-4" />
        <span className="font-semibold">{balance}</span>
        <span className="text-muted-foreground ml-1 hidden sm:inline">
          Points
        </span>
      </Button>
    </Link>
  );
}
