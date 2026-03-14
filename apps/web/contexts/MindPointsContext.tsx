"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MindPointsData {
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
}

interface MindPointsContextValue {
  pointsData: MindPointsData | undefined;
  isLoading: boolean;
}

const MindPointsContext = createContext<MindPointsContextValue | null>(null);

export function MindPointsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const pointsData = useQuery(
    api.mindPoints.getUserPoints,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const value: MindPointsContextValue = {
    pointsData: pointsData ?? undefined,
    isLoading: pointsData === undefined && !!user?.id,
  };

  return (
    <MindPointsContext.Provider value={value}>
      {children}
    </MindPointsContext.Provider>
  );
}

export function useMindPoints(): MindPointsContextValue {
  const context = useContext(MindPointsContext);
  if (!context) {
    // Return safe defaults when used outside provider (e.g., no Clerk)
    return { pointsData: undefined, isLoading: false };
  }
  return context;
}
