import * as React from "react";

import { cn } from "@/lib/utils";

type SoftLeafProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export function SoftLeaf({ className, title, ...props }: SoftLeafProps) {
  const label = title ?? "Leaf illustration";

  return (
    <svg
      viewBox="0 0 220 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-label={title ? label : undefined}
      aria-hidden={title ? undefined : true}
      className={cn("text-primary", className)}
      {...props}
    >
      {title ? <title>{label}</title> : null}
      <path
        d="M206 52c-9 35-46 70-92 74C66 130 30 108 18 83 6 58 16 30 44 18c28-12 68-6 98 10 30 16 72-7 64 24Z"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M52 26c29-13 83 2 114 28 12 10 20 22 24 34"
        stroke="currentColor"
        opacity="0.22"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M66 40c12 24 33 55 65 78"
        stroke="currentColor"
        opacity="0.18"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M86 56c-8 10-15 20-20 31"
        stroke="currentColor"
        opacity="0.12"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M122 70c-5 12-8 24-10 37"
        stroke="currentColor"
        opacity="0.12"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
