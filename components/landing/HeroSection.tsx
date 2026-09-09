"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Shield,
  Sparkles,
} from "lucide-react";
import { LeafAccent } from "@/components/illustrations";

interface HeroSectionProps {
  canAccessAdmin: boolean;
}

const SUPPORT_NOTES = [
  { text: "Practical psychology", icon: BookOpen },
  { text: "Human-centred learning", icon: HeartHandshake },
  { text: "A safe space to grow", icon: Sparkles },
];

export default function HeroSection({ canAccessAdmin }: HeroSectionProps) {
  return (
    <section className="brand-hero relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-20 lg:pb-24">
      <div className="container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="flex items-center justify-center gap-4 lg:justify-start">
              <span className="brand-gold-rule" aria-hidden="true" />
              <span className="brand-kicker">
                Psychology education · healing · growth
              </span>
            </div>

            <h1 className="font-display text-foreground mt-7 text-5xl leading-[0.98] font-medium tracking-[-0.035em] sm:text-6xl lg:text-[5.4rem]">
              Learn. Grow.
              <br />
              <span className="text-primary italic">Heal. Belong.</span>
            </h1>

            <p className="text-muted-foreground mx-auto mt-7 max-w-xl text-lg leading-8 sm:text-xl lg:mx-0">
              A thoughtful learning space for psychology students, aspiring
              professionals, counsellors, and anyone who wants to understand
              themselves and others more deeply.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                asChild
                className="min-w-[12.5rem] rounded-full px-7 shadow-[0_12px_35px_-18px_rgba(15,77,77,0.8)]"
              >
                <Link href="/courses">
                  Explore programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="rounded-full border-primary/20 bg-background/60 px-7 backdrop-blur"
              >
                <Link href="/about">Meet The Mind Point</Link>
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
              {SUPPORT_NOTES.map((note) => {
                const Icon = note.icon;
                return (
                  <span
                    key={note.text}
                    className="text-muted-foreground inline-flex items-center gap-2 text-sm"
                  >
                    <span className="bg-primary/8 text-primary inline-flex rounded-full p-1.5">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {note.text}
                  </span>
                );
              })}
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

          <div className="relative mx-auto w-full max-w-[34rem] lg:mx-0 lg:justify-self-end">
            <LeafAccent className="brand-soft-float text-primary/30 pointer-events-none absolute -top-8 -left-8 z-20 hidden h-16 w-16 -rotate-12 lg:block" />

            <div className="brand-panel relative overflow-hidden rounded-[2.4rem] p-2 sm:p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                <Image
                  src="/illustrations/hero.jpg"
                  alt="A calm, reflective learning atmosphere"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 90vw, 42vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0f4d4d]/45 via-transparent to-[#faf8f3]/5"
                  aria-hidden="true"
                />

                <div className="absolute right-5 bottom-5 left-5 rounded-[1.5rem] border border-white/25 bg-[#fffdf9]/88 p-5 text-left shadow-xl backdrop-blur-md sm:right-6 sm:bottom-6 sm:left-6 sm:p-6">
                  <p className="font-display text-primary text-2xl leading-tight font-medium sm:text-3xl">
                    A kinder, brighter tomorrow starts with understanding.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="h-px w-9 bg-[#b79755]" />
                    <span className="text-primary/75 text-[0.68rem] font-semibold tracking-[0.22em] uppercase">
                      The Mind Point
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-sea-glass/10 absolute -right-8 -bottom-8 h-32 w-32 rounded-full border border-primary/10"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
