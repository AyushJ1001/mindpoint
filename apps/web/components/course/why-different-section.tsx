import { Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { defaultWhyDifferent } from "@/lib/course-content-data";
import type { PublicCourse } from "@mindpoint/backend";

interface WhyDifferentSectionProps {
  course: PublicCourse;
}

export default function WhyDifferentSection({
  course,
}: WhyDifferentSectionProps) {
  const items = course.whyDifferent?.length
    ? course.whyDifferent
    : defaultWhyDifferent[course.type || "certificate"] || [];

  if (items.length === 0) return null;

  return (
    <section className="course-section-md">
      <div className="container">
        <ScrollReveal>
          <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-10">
            <div className="space-y-4 lg:sticky lg:top-24">
              <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                How this feels different
              </span>
              <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                Thoughtful structure, but never at the cost of warmth.
              </h2>
              <p className="text-muted-foreground text-base leading-7 sm:text-lg">
                Most courses stop at information. This one is meant to feel
                closer, clearer, and more usable in the situations that actually
                matter.
              </p>
              <p className="text-muted-foreground/85 text-sm leading-6 sm:text-base">
                You are not just collecting language here. You are building a
                steadier way of working, noticing, and responding.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="course-subpanel rounded-[1.4rem] px-5 py-5 sm:px-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <Sparkles className="text-primary h-4.5 w-4.5" />
                    </div>
                    <span className="text-primary/70 text-xs font-semibold tracking-[0.22em] uppercase">
                      {`0${i + 1}`}
                    </span>
                  </div>
                  <p className="text-foreground text-base leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
