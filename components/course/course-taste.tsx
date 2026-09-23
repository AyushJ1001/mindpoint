"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { ScrollReveal } from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

export interface CourseTasteContent {
  eyebrow: string;
  heading: string;
  emphasis: string;
  intro: string;
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  reframeLabel: string;
  reframe: string;
  footnote: string;
}

export const defaultCourseTaste: CourseTasteContent = {
  eyebrow: "Try it before you buy anything",
  heading: "The core move, in",
  emphasis: "30 seconds.",
  intro:
    "Most of this work is one repeated skill: catch the automatic thought, then reframe it. Here's a real one. Spot what's bending it.",
  scenario:
    "\u201cI sent one bad email to my manager. I'm going to get fired and my whole career is over.\u201d",
  question: "Which pattern is driving this?",
  options: ["Mind reading", "Catastrophising", "Emotional reasoning"],
  correctIndex: 1,
  explanation:
    "Catastrophising. One small event gets spun into the worst possible ending, with every step in between skipped. Naming it is half the work.",
  reframeLabel: "A balanced thought",
  reframe:
    "\u201cOne email is one email. If there's a problem, I can address it. A single mistake doesn't end a career.\u201d",
  footnote:
    "That's the move. In the live cohort you practise it again and again, with feedback, until it feels normal.",
};

export default function CourseTaste({
  content = defaultCourseTaste,
}: {
  content?: CourseTasteContent;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = selected === content.correctIndex;

  return (
    <section className="calm-section-tight" id="taste">
      <div className="calm-container">
        <ScrollReveal>
          <p className="calm-section-number">{content.eyebrow}</p>
          <h2 className="calm-section-title mt-5">
            {content.heading}{" "}
            <em className="text-terracotta italic">{content.emphasis}</em>
          </h2>
          <p className="calm-section-lead mt-5 max-w-[60ch]">{content.intro}</p>

          <div className="border-foreground/10 bg-card mt-8 rounded-2xl border p-6 sm:p-8">
            <blockquote className="calm-pull-quote">{content.scenario}</blockquote>

            <p className="text-foreground mt-6 text-sm font-semibold">
              {content.question}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {content.options.map((option, index) => {
                const isSelected = selected === index;
                const isCorrectOption = index === content.correctIndex;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={answered}
                    onClick={() => setSelected(index)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      !answered &&
                        "border-foreground/15 hover:border-primary hover:text-primary",
                      answered &&
                        isCorrectOption &&
                        "border-primary bg-primary/10 text-primary font-medium",
                      answered &&
                        isSelected &&
                        !isCorrectOption &&
                        "border-red-300 bg-red-50 text-red-700",
                      answered &&
                        !isSelected &&
                        !isCorrectOption &&
                        "border-foreground/10 text-foreground/50",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="border-foreground/10 mt-6 border-t pt-5">
                <p className="text-foreground flex items-start gap-2 text-sm">
                  {correct ? (
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  )}
                  <span>{content.explanation}</span>
                </p>

                <div className="bg-secondary/50 mt-5 rounded-xl p-5">
                  <p className="calm-kbd">{content.reframeLabel}</p>
                  <p className="calm-pull-quote mt-2">{content.reframe}</p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-muted-foreground max-w-[52ch] text-xs">
                    {content.footnote}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="calm-link inline-flex items-center gap-1.5 text-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Try again
                  </button>
                </div>
              </div>
            )}

            {!answered && (
              <p className="text-muted-foreground mt-6 inline-flex items-center gap-1.5 text-xs">
                Pick one to see the answer
                <ArrowRight className="h-3.5 w-3.5" />
              </p>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
