import * as React from "react";

type Props = {
  className?: string;
  title?: string;
};

export function WavyDivider({ className, title = "Divider" }: Props) {
  return (
    <svg
      viewBox="0 0 600 72"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 44c44 0 44-18 88-18s44 18 88 18 44-18 88-18 44 18 88 18 44-18 88-18 44 18 88 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.28"
      />
      <path
        d="M0 56c44 0 44-10 88-10s44 10 88 10 44-10 88-10 44 10 88 10 44-10 88-10 44 10 88 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.18"
      />
      <path
        d="M0 32c44 0 44-24 88-24s44 24 88 24 44-24 88-24 44 24 88 24 44-24 88-24 44 24 88 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.12"
      />
    </svg>
  );
}
