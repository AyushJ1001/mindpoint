import Image from "next/image";
import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  image?: string;
  imageAlt?: string;
  caption?: string;
  actions?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt = "",
  actions,
}: PageHeroProps) {
  return (
    <section className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <div className="container">
        <span className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
          {eyebrow}
        </span>
        <h1 className="font-display text-foreground mt-4 max-w-[20ch] text-4xl leading-[1.04] tracking-[-0.03em] sm:text-6xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-5 max-w-xl text-lg">{lead}</p>
        {actions ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>

      {image ? (
        <div className="mt-12 sm:mt-16">
          <div className="relative h-[280px] w-full overflow-hidden sm:h-[420px]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority
              sizes="100vw"
              className="water-drift-slow object-cover"
            />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f4f8f7] to-transparent" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
