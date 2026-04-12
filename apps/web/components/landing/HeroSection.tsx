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

interface HeroSectionProps {
  canAccessAdmin: boolean;
}

const SUPPORT_NOTES = [
  { text: "Personal support", icon: HeartHandshake },
  { text: "Career growth", icon: BookOpen },
  { text: "A warmer pace", icon: Sparkles },
];

export default function HeroSection({ canAccessAdmin }: HeroSectionProps) {
  return (
    <section className="relative min-h-[75vh] overflow-hidden pt-14 pb-14 sm:min-h-[70vh] sm:pt-18 lg:pt-20">
      {/* ── Full-bleed background image ── */}
      <Image
        src="/illustrations/hero.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />

      {/* Gradient overlay – strong on the text side, fades to reveal image */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-background/[0.92] via-background/75 to-background/40 sm:from-background/[0.88] sm:via-background/65 sm:to-background/30"
        aria-hidden="true"
      />
      {/* Bottom fade into next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 container flex min-h-[60vh] items-center sm:min-h-[55vh]">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="text-primary/90 text-xs font-semibold tracking-[0.34em] uppercase">
              Mental health learning, made more human
            </span>
            <h1 className="font-display text-foreground mt-5 text-4xl leading-[1.04] font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-[4.4rem]">
              Your mind deserves the same care you give to others.
            </h1>

            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-8 sm:text-xl">
              Join a warm, serious learning space for people who want support,
              direction, and skills they can actually carry into life and work.
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

            {/* Support notes – inline text with icons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
              {SUPPORT_NOTES.map((note) => {
                const Icon = note.icon;
                return (
                  <span
                    key={note.text}
                    className="text-muted-foreground inline-flex items-center gap-2 text-sm"
                  >
                    <span className="bg-primary/8 text-primary/70 inline-flex rounded-full p-1.5">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {note.text}
                  </span>
                );
              })}
            </div>

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
        </div>
      </div>
    </section>
  );
}
