"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The public-site main element. Applies the TMP water surface to every public
 * route, and leaves internal surfaces (/admin) on the plain background.
 */
export function WaterMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isInternal = pathname.startsWith("/admin");

  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      className={cn("flex-grow", !isInternal && "water-page")}
    >
      {children}
    </main>
  );
}
