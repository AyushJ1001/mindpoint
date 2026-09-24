import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "wash" | "mist" | "deep";
type Width = "narrow" | "wide";

const TONE_CLASS: Record<Tone, string> = {
  wash: "",
  mist: "water-band-mist",
  deep: "water-band-deep water-on-deep",
};

const WIDTH_CLASS: Record<Width, string> = {
  narrow: "max-w-3xl",
  wide: "max-w-6xl",
};

export function Section({
  id,
  eyebrow,
  title,
  lead,
  tone = "wash",
  width = "wide",
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  tone?: Tone;
  width?: Width;
  children?: ReactNode;
  className?: string;
}) {
  const isDeep = tone === "deep";

  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-16 sm:py-24", TONE_CLASS[tone], className)}
    >
      <div className={cn("mx-auto w-full px-5 sm:px-6", WIDTH_CLASS[width])}>
        {(eyebrow || title || lead) && (
          <header className="mb-10 sm:mb-14">
            {eyebrow ? (
              <p className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2
                className={cn(
                  "font-display mt-4 max-w-[24ch] text-3xl leading-[1.1] tracking-[-0.02em] sm:text-4xl",
                  !isDeep && "text-foreground",
                )}
              >
                {title}
              </h2>
            ) : null}
            {lead ? (
              <p
                className={cn(
                  "mt-5 max-w-[62ch] text-base leading-relaxed sm:text-lg",
                  isDeep ? "text-[#f1ece0]/80" : "text-muted-foreground",
                )}
              >
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

export function Rule({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("water-rule block w-full", className)} />;
}

/** A calm two-line wave, coloured for the TMP water system. */
export function WaterWave({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M0,30 C200,8 350,52 600,28 C850,4 1000,46 1200,24"
        fill="none"
        stroke="#bcd6dd"
        strokeWidth="1.5"
        strokeOpacity="0.75"
      />
      <path
        d="M0,42 C250,22 400,56 650,34 C900,12 1050,48 1200,34"
        fill="none"
        stroke="#bcd6dd"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
    </svg>
  );
}
