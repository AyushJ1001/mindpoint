"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

interface HeroSectionProps {
  canAccessAdmin: boolean;
}

export default function HeroSection({ canAccessAdmin }: HeroSectionProps) {
  return (
    <section className="tmp-coastal-hero relative isolate overflow-hidden border-b border-primary/5">
      <div className="grid min-h-[42rem] lg:min-h-[46rem] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative z-10 flex items-center bg-[#fffdf9] px-6 py-16 sm:px-10 lg:px-[7vw] lg:py-20">
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-[#b79755]" aria-hidden="true" />
              <span className="text-[0.68rem] font-semibold tracking-[0.25em] text-[#0f4d4d]/60 uppercase">
                Psychology education · healing · growth
              </span>
            </div>

            <h1 className="font-display text-[#173f3d] text-[clamp(3.8rem,7vw,6.6rem)] leading-[0.88] font-medium tracking-[-0.055em]">
              A Kinder,
              <br />
              <span className="italic">Brighter You.</span>
            </h1>

            <p className="mt-7 max-w-[35rem] text-lg leading-8 text-[#58706d] sm:text-xl">
              Practical tools. Compassionate guidance. Psychology learning that
              helps you understand, grow, and move forward with more clarity.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="rounded-full bg-[#0f4d4d] px-7 text-[#faf8f3] shadow-[0_18px_36px_-20px_rgba(15,77,77,0.7)] hover:bg-[#173f3d]"
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
                className="rounded-full border-[#0f4d4d]/20 bg-white px-7 text-[#173f3d] hover:bg-[#eef5f3]"
              >
                <Link href="/about">Discover TMP</Link>
              </Button>
            </div>

            <div className="mt-11 text-[0.68rem] font-semibold tracking-[0.24em] text-[#0f4d4d]/55 uppercase">
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

        <div className="relative min-h-[29rem] overflow-hidden lg:min-h-full">
          <Image
            src="/illustrations/hero.jpg"
            alt="Calm coastal landscape representing growth and reflection"
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#fffdf9]/22 via-transparent to-transparent lg:from-[#fffdf9]/12" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f4d4d]/10 via-transparent to-[#fffdf9]/6" />

          <div className="absolute right-7 bottom-7 max-w-[15rem] rounded-[1.4rem] border border-white/35 bg-white/68 p-5 text-right shadow-lg backdrop-blur-md sm:right-10 sm:bottom-10">
            <p className="font-display text-2xl leading-tight font-medium text-[#173f3d] italic">
              Wellness belongs here.
            </p>
            <span className="mt-3 inline-block h-px w-9 bg-[#b79755]" />
          </div>

          <div className="pointer-events-none absolute -right-14 -bottom-14 h-56 w-56 rounded-full border border-white/35 bg-[#8ec1c3]/12 backdrop-blur-[2px]" />
          <div className="pointer-events-none absolute top-8 right-8 h-24 w-24 rounded-full border border-white/30 bg-white/8" />
        </div>
      </div>
    </section>
  );
}
