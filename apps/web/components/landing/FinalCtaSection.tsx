import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      {/* ── Full-bleed background image ── */}
      <Image
        src="/illustrations/hope.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />

      {/* Gradient overlay – readable text */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-background/[0.88] via-background/70 to-background/50"
        aria-hidden="true"
      />
      {/* Top fade from previous section */}
      <div
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 container">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-primary/90 text-xs font-semibold tracking-[0.32em] uppercase">
              One simple next step
            </span>
            <h2 className="font-display text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Still thinking? Start smaller, not harder.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              You don&apos;t need to force certainty. Pick the next step that
              feels kind, clear, and manageable.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/courses/therapy">Book your first session</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
