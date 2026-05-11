import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Clock, Shield, Calendar } from "lucide-react";
import Link from "next/link";

const HIGHLIGHTS = [
  { label: "~20 min session", icon: Clock },
  { label: "Licensed professional", icon: Shield },
  { label: "Flexible scheduling", icon: Calendar },
];

export default function FeaturedEntrySection() {
  return (
    <section className="home-section-sm">
      <div className="container">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
              A smaller first step
            </span>
            <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Not sure where to begin? Start with one calm conversation.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-8">
              Book a single therapy session. No pressure to commit to the
              whole path at once, just a supportive first moment with someone
              who listens.
            </p>

            {/* Highlights as inline badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {HIGHLIGHTS.map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.label}
                    className="text-foreground/80 bg-primary/5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                  >
                    <Icon className="text-primary/60 h-4 w-4" />
                    {item.label}
                  </span>
                );
              })}
            </div>

            {/* Pricing + CTA */}
            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-foreground text-xl font-semibold">
                Starting from ₹600
              </p>
              <p className="text-muted-foreground text-sm">
                One session is enough to begin getting oriented.
              </p>
              <Button size="lg" className="mt-4" asChild>
                <Link href="/courses/therapy">Book your first session</Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
