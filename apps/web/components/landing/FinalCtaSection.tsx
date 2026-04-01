import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FinalCtaSection() {
  return (
    <section className="home-section-sm pb-18">
      <div className="container">
        <ScrollReveal>
          <div className="home-shell mx-auto max-w-4xl px-8 py-10 text-center sm:px-10">
            <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
              One simple next step
            </span>
            <h2 className="font-display text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
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
