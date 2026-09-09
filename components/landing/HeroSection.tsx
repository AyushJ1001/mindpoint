"use client";

import Link from "next/link";
import Image from "next/image";
import { Lora } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

interface HeroSectionProps {
  canAccessAdmin: boolean;
}

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export default function HeroSection({ canAccessAdmin }: HeroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#0f4d4d]/5 bg-[#fbfaf6]">
      <div className="grid min-h-[38rem] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 flex items-center bg-[#fbfaf6] px-6 py-14 sm:px-10 lg:px-[6.5vw] lg:py-16">
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-10 bg-[#b79755]" aria-hidden="true" />
              <span className="text-[0.66rem] font-semibold tracking-[0.24em] text-[#0f4d4d]/60 uppercase">
                Psychology education · healing · growth
              </span>
            </div>

            <h1
              className={`${lora.className} text-5xl leading-[0.98] font-medium tracking-[-0.035em] text-[#173f3d] sm:text-6xl lg:text-[5.4rem]`}
            >
              A Kinder,
              <br />
              <span className="italic">Brighter You.</span>
            </h1>

            <p className="mt-6 max-w-[34rem] text-base leading-7 text-[#58706d] sm:text-lg sm:leading-8">
              Practical tools. Compassionate guidance. Psychology learning that
              helps you understand, grow, and move forward with more clarity.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="rounded-full bg-[#0f4d4d] px-7 text-[#faf8f3] shadow-[0_16px_30px_-20px_rgba(15,77,77,0.65)] hover:bg-[#173f3d]"
              >
                <Link href="/courses">
                  Start your journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="rounded-full border-[#0f4d4d]/18 bg-white/80 px-7 text-[#173f3d] hover:bg-[#f0f6f4]"
              >
                <Link href="/about">Discover TMP</Link>
              </Button>
            </div>

            <div className="mt-9 text-[0.66rem] font-semibold tracking-[0.23em] text-[#0f4d4d]/55 uppercase">
              Learn · Grow · Heal · Belong
            </div>

            {canAccessAdmin && (
              <div className="mt-5">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="relative min-h-[24rem] overflow-hidden lg:min-h-full">
          <Image
            src="/tmp-coastal-hero.svg"
            alt="Coastal landscape with olive leaves, matching The Mind Point's new visual identity"
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 1024px) 100vw, 56vw"
          />

          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#fbfaf6] via-[#fbfaf6]/38 to-transparent lg:block"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
