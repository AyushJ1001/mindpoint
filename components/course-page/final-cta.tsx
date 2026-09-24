import Image from "next/image";

import type { CourseCta } from "@/lib/course-content/types";

export function FinalCTA({ cta }: { cta: CourseCta }) {
  return (
    <section
      id="enquire"
      className="water-on-deep relative scroll-mt-24 overflow-hidden"
    >
      <Image
        src="/coastal/hero.jpg"
        alt="Turquoise water meeting pale sand, seen from above."
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f2a28]/80 via-[#123a37]/75 to-[#1d4e4a]/85" />

      <div className="relative mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-6 sm:py-28">
        <h2 className="font-display text-3xl leading-[1.1] tracking-[-0.02em] text-balance text-[#f1ece0] sm:text-4xl">
          {cta.heading}
        </h2>
        {cta.body ? (
          <p className="mx-auto mt-5 max-w-[52ch] text-lg leading-relaxed text-[#f1ece0]/80">
            {cta.body}
          </p>
        ) : null}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#options"
            className="inline-flex items-center gap-2 rounded-full bg-[#f1ece0] px-6 py-3 text-sm font-medium text-[#0f2a28] transition-transform hover:-translate-y-0.5"
          >
            {cta.primaryLabel}
            <span aria-hidden="true">›</span>
          </a>
          {cta.secondaryHref && cta.secondaryLabel ? (
            <a
              href={cta.secondaryHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#bcd6dd]/40 px-6 py-3 text-sm font-medium text-[#f1ece0] transition-colors hover:bg-[#f1ece0]/10"
            >
              {cta.secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
