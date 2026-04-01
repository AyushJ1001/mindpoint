import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FinalCtaSection() {
  return (
    <section className="section-padding bg-primary/5">
      <div className="container mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready when you are.
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            No rush. No pressure. Just a space that&apos;s here whenever
            you&apos;re ready to begin.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/courses">Explore our programs</Link>
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
