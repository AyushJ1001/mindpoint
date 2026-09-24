import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * An immersive deep-teal band with light text, for emphasis sections and CTAs.
 */
export function WaterBand({
  children,
  className,
  eyebrow,
  title,
  lead,
  width = "wide",
}: {
  children?: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  width?: "narrow" | "wide";
}) {
  return (
    <section
      className={cn(
        "water-band-deep water-on-deep py-16 sm:py-24",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto w-full px-5 sm:px-6",
          width === "narrow" ? "max-w-3xl" : "max-w-6xl",
        )}
      >
        {(eyebrow || title || lead) && (
          <header className="mb-10 sm:mb-14">
            {eyebrow ? (
              <p className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="font-display mt-4 max-w-[24ch] text-3xl leading-[1.1] tracking-[-0.02em] sm:text-4xl">
                {title}
              </h2>
            ) : null}
            {lead ? (
              <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-[#f1ece0]/80 sm:text-lg">
                {lead}
              </p>
            ) : null}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
