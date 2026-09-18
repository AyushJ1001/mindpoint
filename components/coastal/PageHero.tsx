import Image from "next/image";
import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  image: string;
  imageAlt?: string;
}

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt = "",
}: PageHeroProps) {
  return (
    <section className="py-14 sm:py-20">
      <div className="container grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
            {eyebrow}
          </span>
          <h1 className="font-display mt-4 text-4xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{lead}</p>
        </div>
        <div className="relative aspect-[5/4] overflow-hidden rounded shadow-[0_40px_80px_-50px_rgba(19,46,43,0.6)]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
