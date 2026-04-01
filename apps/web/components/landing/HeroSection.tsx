"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

interface HeroSectionProps {
  canAccessAdmin: boolean;
}

export default function HeroSection({ canAccessAdmin }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
      {/* Subtle sage gradient orb */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.07 150 / 0.4), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h1 className="font-display text-foreground text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Your mind deserves the same care you give to others.
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
          Join a cohort of learners walking the same path — from psychology
          students to practicing professionals, building real skills in mental
          health together.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/courses">
              Begin your journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">See what&apos;s possible</Link>
          </Button>
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
    </section>
  );
}
