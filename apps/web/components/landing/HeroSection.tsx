"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Shield,
  Sparkles,
} from "lucide-react";

interface HeroSectionProps {
  canAccessAdmin: boolean;
}

const SUPPORT_NOTES = [
  {
    title: "Personal support",
    description:
      "Therapy and counselling that feels calm, human, and accessible.",
    icon: HeartHandshake,
  },
  {
    title: "Career growth",
    description:
      "Certificates, internships, and supervision that lead to usable skill.",
    icon: BookOpen,
  },
  {
    title: "A warmer pace",
    description:
      "Learning and support designed for real lives, not ideal schedules.",
    icon: Sparkles,
  },
];

export default function HeroSection({ canAccessAdmin }: HeroSectionProps) {
  return (
    <section className="home-section-lg relative overflow-hidden pt-14 pb-14 sm:pt-18 lg:pt-20">
      {/* Decorative gradient blobs */}
      <div
        className="pointer-events-none absolute top-18 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-[0.18]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.68 0.08 290 / 0.5), transparent 68%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-24 left-[14%] h-[260px] w-[260px] rounded-full opacity-[0.15]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.92 0.04 25 / 0.85), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container">
        <div className="home-shell mx-auto max-w-6xl overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl text-center lg:text-left">
              <span className="text-primary/80 text-xs font-semibold tracking-[0.34em] uppercase">
                Mental health learning, made more human
              </span>
              <h1 className="font-display text-foreground mt-5 text-4xl leading-[1.04] font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-[4.4rem]">
                Your mind deserves the same care you give to others.
              </h1>

              <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
                Join a warm, serious learning space for people who want support,
                direction, and skills they can actually carry into life and
                work.
              </p>

              <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button size="lg" asChild className="min-w-[12rem]">
                  <Link href="/courses">
                    Begin your journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#paths">Find the right support</Link>
                </Button>
              </div>

              <p className="text-muted-foreground mt-4 text-sm leading-6 sm:text-base">
                Start with therapy, training, or a first small step. You do not
                need to have the whole path figured out yet.
              </p>

              {canAccessAdmin && (
                <div className="mt-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {SUPPORT_NOTES.map((note) => {
                const Icon = note.icon;
                return (
                  <article
                    key={note.title}
                    className="home-subpanel rounded-[1.5rem] px-5 py-5 text-left"
                  >
                    <div className="bg-primary/10 text-primary mb-4 inline-flex rounded-full p-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-foreground text-lg font-semibold">
                      {note.title}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {note.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
