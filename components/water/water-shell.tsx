import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Applies the TMP water surface (layered sky→mist→ivory→sand wash) to a page.
 * Use once per public route.
 */
export function WaterShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("water-page", className)}>{children}</div>;
}
