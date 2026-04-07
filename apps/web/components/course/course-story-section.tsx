"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { defaultOutcomes, defaultPainPoints } from "@/lib/course-content-data";
import type { PublicCourse } from "@mindpoint/backend";

interface CourseStorySectionProps {
  course: PublicCourse;
}

export default function CourseStorySection({
  course,
}: CourseStorySectionProps) {
  const painPoints = course.painPoints?.length
    ? course.painPoints
    : defaultPainPoints[course.type || "certificate"] || [];

  const outcomes = course.outcomes?.length
    ? course.outcomes
    : course.learningOutcomes?.length
      ? course.learningOutcomes.map((learningOutcome) => learningOutcome.title)
      : defaultOutcomes[course.type || "certificate"] || [];
  const keyOutcomes = outcomes.slice(0, 5);

  if (painPoints.length === 0 && keyOutcomes.length === 0) return null;

  return (
    <section className="course-section-md relative -mt-6 sm:-mt-8">
      <div className="container">
        <ScrollReveal>
          <div className="mx-auto max-w-6xl px-2 sm:px-4">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
              <div className="space-y-4 lg:pt-2">
                <span className="text-primary/75 text-xs font-semibold tracking-[0.32em] uppercase">
                  A gentler way in
                </span>
                <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                  A page that meets people where they are, then shows what opens
                  up.
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg">
                  This program should feel less like a pitch deck and more like
                  a clear, welcoming conversation. Here is the shift it is
                  designed to support.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {painPoints.length > 0 && (
                  <div className="rounded-2xl bg-card/40 px-5 py-6 backdrop-blur-sm sm:px-6">
                    <div className="mb-4">
                      <p className="text-primary text-sm font-semibold tracking-[0.24em] uppercase">
                        You&apos;re here because
                      </p>
                      <h3 className="text-foreground mt-3 text-2xl font-semibold">
                        Something here already feels familiar.
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
                        You do not need another distant, theory-heavy
                        experience. You need something that makes sense in the
                        middle of real life.
                      </p>
                    </div>
                    <ul className="space-y-3">
                      {painPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="text-primary mt-1 h-4.5 w-4.5 shrink-0" />
                          <span className="text-foreground text-sm leading-6 sm:text-[0.96rem]">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {keyOutcomes.length > 0 && (
                  <div className="rounded-2xl bg-card/40 px-5 py-6 backdrop-blur-sm sm:px-6">
                    <div className="mb-4">
                      <p className="text-primary text-sm font-semibold tracking-[0.24em] uppercase">
                        What changes after
                      </p>
                      <h3 className="text-foreground mt-3 text-2xl font-semibold">
                        Five changes that make the course feel worth
                        considering.
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
                        Not an endless list. Just the clearest shifts you can
                        expect to carry into how you think, respond, and show
                        up.
                      </p>
                    </div>
                    <ul className="space-y-3">
                      {keyOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <ArrowRight className="text-primary mt-1 h-4.5 w-4.5 shrink-0" />
                          <span className="text-foreground text-sm leading-6 sm:text-[0.96rem]">
                            {outcome}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
