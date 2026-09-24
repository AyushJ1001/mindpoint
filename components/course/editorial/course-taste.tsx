"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";

import { ScrollReveal } from "@/components/ScrollReveal";
import { cleanList } from "@/components/course/editorial/helpers";
import { cn } from "@/lib/utils";
import type { PublicCourse } from "@/lib/backend";

interface Props {
  course: PublicCourse;
}

export default function CourseTaste({ course }: Props) {
  const prompts = cleanList(course.painPoints).slice(0, 4);
  const outcomes = cleanList(course.outcomes).slice(0, 4);
  const why = cleanList(course.whyDifferent).slice(0, 4);
  const [selected, setSelected] = useState<number | null>(null);

  if (prompts.length === 0) return null;

  const answered = selected !== null;
  const response =
    (selected !== null ? outcomes[selected] : undefined) ??
    outcomes[0] ??
    why[0] ??
    "";

  return (
    <section id="taste" className="calm-section-tight scroll-mt-24">
      <div className="calm-container">
        <ScrollReveal>
          <p className="calm-section-number">Try it before you buy anything</p>
          <h2 className="calm-section-title mt-5">
            Start where you actually{" "}
            <em className="text-terracotta italic">are</em>.
          </h2>
          <p className="calm-section-lead mt-5 max-w-[60ch]">
            Pick the line that sounds most like you. We&rsquo;ll show you what
            this course changes about it.
          </p>

          <div className="border-foreground/10 bg-card mt-8 rounded-2xl border p-6 sm:p-8">
            <p className="text-foreground text-sm font-semibold">
              Which of these is true for you right now?
            </p>

            <div className="mt-4 space-y-2">
              {prompts.map((prompt, index) => {
                const isSelected = selected === index;
                return (
                  <button
                    key={prompt}
                    type="button"
                    disabled={answered}
                    onClick={() => setSelected(index)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                      !answered &&
                        "border-foreground/12 hover:border-primary hover:text-primary",
                      answered &&
                        isSelected &&
                        "border-primary bg-primary/8 text-foreground font-medium",
                      answered &&
                        !isSelected &&
                        "border-foreground/10 text-foreground/50",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 flex-none rounded-full",
                        isSelected ? "bg-primary" : "bg-foreground/25",
                      )}
                    />
                    {prompt}
                  </button>
                );
              })}
            </div>

            {answered && response ? (
              <div className="border-foreground/10 mt-6 border-t pt-5">
                <p className="text-foreground flex items-start gap-2 text-sm">
                  <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    That&rsquo;s the starting point this course is built around.
                  </span>
                </p>

                <div className="bg-secondary/50 mt-5 rounded-xl p-5">
                  <p className="calm-kbd">What changes</p>
                  <p className="calm-pull-quote mt-2">{response}</p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-muted-foreground max-w-[52ch] text-xs">
                    Every module is built so you leave with something you can
                    actually use.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="calm-link inline-flex items-center gap-1.5 text-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Try again
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground mt-6 inline-flex items-center gap-1.5 text-xs">
                Pick one to see what changes
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </p>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
