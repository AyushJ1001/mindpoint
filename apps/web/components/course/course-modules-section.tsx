"use client";

import { BookOpen, Check } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function CourseModulesSection({
  learningOutcomes,
}: {
  learningOutcomes: Array<{
    icon: string;
    title: string;
  }>;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <ScrollReveal>
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="pb-6 text-center">
            <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              What Will You Learn?
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Essential skills and knowledge you&apos;ll gain from this course
            </p>
          </div>

          <div className="space-y-6">
            {learningOutcomes.map((outcome, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-6 pb-6">
                  <div className="flex-1">
                    <p className="text-foreground text-lg leading-relaxed md:text-xl">
                      <span className="mr-3 text-2xl">{outcome.icon}</span>
                      {outcome.title}
                    </p>
                  </div>
                  <div className="mt-1 flex-shrink-0">
                    <div className="border-border flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 group-hover:bg-foreground">
                      <Check className="text-foreground h-4 w-4 transition-colors duration-200 group-hover:text-background" />
                    </div>
                  </div>
                </div>
                {index < learningOutcomes.length - 1 && (
                  <div className="h-px bg-border" />
                )}
              </div>
            ))}
          </div>

          {/* Additional Info Cards */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
                <BookOpen className="text-primary h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">
                  Progressive Learning
                </div>
                <div className="text-muted-foreground text-sm">
                  Step-by-step curriculum
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
                <span className="text-lg">{"\uD83C\uDFAF"}</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">
                  Practical Focus
                </div>
                <div className="text-muted-foreground text-sm">
                  Real-world applications
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
                <span className="text-lg">{"\uD83D\uDCA1"}</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">
                  Expert Guidance
                </div>
                <div className="text-muted-foreground text-sm">
                  Industry professionals
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
