import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Clock, HeartHandshake, Calendar } from "lucide-react";
import Link from "next/link";

const HIGHLIGHTS = [
  { label: "A focused first conversation", icon: Clock },
  { label: "Thoughtful, human support", icon: HeartHandshake },
  { label: "Flexible scheduling", icon: Calendar },
];

export default function FeaturedEntrySection() {
  return (
    <section className="home-section-md relative">
      <div className="container">
        <ScrollReveal>
          <div className="brand-panel mx-auto max-w-5xl overflow-hidden rounded-[2.4rem]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-[#0f4d4d] p-8 text-[#faf8f3] sm:p-10 lg:p-12">
                <span className="text-[#9fd0cf] text-xs font-semibold tracking-[0.28em] uppercase">
                  A smaller first step
                </span>
                <h2 className="font-display mt-4 text-4xl leading-tight font-medium sm:text-5xl">
                  You do not need to arrive with everything figured out.
                </h2>
                <p className="mt-5 text-base leading-8 text-[#d6e3e0] sm:text-lg">
                  Sometimes the most useful beginning is simply one calm,
                  focused conversation that helps you understand what you need
                  next.
                </p>
              </div>

              <div className="bg-[#fffdf9] p-8 sm:p-10 lg:p-12">
                <div className="space-y-4">
                  {HIGHLIGHTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-4 border-b border-border/70 pb-4 last:border-b-0"
                      >
                        <span className="bg-primary/8 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-foreground text-sm font-medium sm:text-base">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="brand-kicker">Personal support</p>
                    <p className="font-display text-foreground mt-2 text-3xl font-medium">
                      Starting from ₹600
                    </p>
                  </div>
                  <Button size="lg" className="rounded-full px-7" asChild>
                    <Link href="/courses/therapy">Explore therapy sessions</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
