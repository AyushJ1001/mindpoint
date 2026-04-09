import * as React from "react";

import { cn } from "@/lib/utils";

export function WarmSparkleCluster({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 420 240"
      fill="none"
      role="img"
      aria-hidden="true"
      className={cn("text-primary/50", className)}
      {...props}
    >
      <g opacity="0.95">
        <path
          d="M132 40c3 18 10 25 28 28-18 3-25 10-28 28-3-18-10-25-28-28 18-3 25-10 28-28Z"
          fill="currentColor"
          opacity="0.55"
        />
        <path
          d="M196 22c2 12 7 16 19 18-12 2-17 7-19 19-2-12-7-17-19-19 12-2 17-6 19-18Z"
          fill="currentColor"
          opacity="0.35"
        />
        <path
          d="M256 52c3 18 10 25 28 28-18 3-25 10-28 28-3-18-10-25-28-28 18-3 25-10 28-28Z"
          fill="currentColor"
          opacity="0.45"
        />
      </g>
      <g opacity="0.9">
        <path
          d="M300 140c2 12 7 16 19 18-12 2-17 7-19 19-2-12-7-17-19-19 12-2 17-6 19-18Z"
          fill="currentColor"
          opacity="0.32"
        />
        <path
          d="M160 150c2 12 7 16 19 18-12 2-17 7-19 19-2-12-7-17-19-19 12-2 17-6 19-18Z"
          fill="currentColor"
          opacity="0.28"
        />
        <path
          d="M96 126c3 18 10 25 28 28-18 3-25 10-28 28-3-18-10-25-28-28 18-3 25-10 28-28Z"
          fill="currentColor"
          opacity="0.24"
        />
      </g>
      <g>
        <circle cx="340" cy="64" r="6" fill="currentColor" opacity="0.22" />
        <circle cx="78" cy="64" r="5" fill="currentColor" opacity="0.18" />
        <circle cx="236" cy="206" r="5" fill="currentColor" opacity="0.16" />
      </g>
    </svg>
  );
}
