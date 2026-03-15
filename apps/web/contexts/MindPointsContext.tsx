"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";

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
  const { isAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth();
  const pointsData = useQuery(
    api.mindPoints.getUserPoints,
    isAuthenticated ? {} : "skip",
  );

  const value: MindPointsContextValue = {
    pointsData: pointsData ?? undefined,
    isLoading:
      !!user &&
      (isConvexAuthLoading || (isAuthenticated && pointsData === undefined)),
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
