import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

interface HeroSectionProps {
  canAccessAdmin: boolean;
}

export default function HeroSection({ canAccessAdmin }: HeroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#0f4d4d]/7 bg-[#fbfaf6]">
      <Image
        src="/tmp-coastal-hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[65%_center] lg:object-center"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(251,250,246,0.96)_0%,rgba(251,250,246,0.9)_48%,rgba(251,250,246,0)_78%)] lg:bg-[linear-gradient(90deg,rgba(251,250,246,0.6)_0%,rgba(251,250,246,0.15)_42%,transparent_65%)]" />
      <div className="relative container flex min-h-[40rem] items-start pt-12 pb-52 sm:pt-16 lg:min-h-[35rem] lg:items-center lg:py-16">
        <div className="max-w-[34rem]">
          <h1 className="font-display text-4xl leading-[1.04] font-semibold tracking-[-0.025em] text-[#173f3d] sm:text-5xl md:text-6xl lg:text-[4.4rem]">
            A Kinder,
            <br />
            <span className="italic">Brighter You.</span>
          </h1>
          <p className="mt-6 max-w-[27rem] text-lg leading-8 text-[#173f3d]">
            Practical tools. Compassionate guidance.
            <br />A more mindful tomorrow.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/courses"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f4d4d] px-7 py-3.5 text-sm font-semibold text-[#faf8f3] transition hover:bg-[#173f3d]"
            >
              Start your journey
              <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-[#173f3d] underline decoration-[#173f3d]/40 underline-offset-4 hover:decoration-current"
            >
              Discover TMP
            </Link>
          </div>
          <p className="mt-9 text-xs font-semibold tracking-[0.2em] text-[#173f3d] uppercase">
            Learn · Grow · Heal · Belong
          </p>
          {canAccessAdmin && (
            <Link
              href="/admin"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#173f3d] underline underline-offset-4"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              Admin
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
