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
          <div className="home-shell-soft mx-auto grid max-w-5xl gap-6 rounded-[1.9rem] px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="max-w-xl text-center lg:text-left">
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
            </div>

            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {HIGHLIGHTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="home-subpanel rounded-[1.2rem] px-4 py-4 text-center"
                    >
                      <div className="bg-primary/10 text-primary mb-3 inline-flex rounded-full p-2.5">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-foreground text-sm font-medium">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-foreground text-xl font-semibold">
                    Starting from ₹600
                  </p>
                  <p className="text-muted-foreground text-sm">
                    One session is enough to begin getting oriented.
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link href="/courses/therapy">Book your first session</Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
