"use client";

import { useState } from "react";

import { Section } from "@/components/course-page/section";
import { cn } from "@/lib/utils";
import type { ProgrammeCurriculum } from "@/lib/course-content/types";

export function CurriculumTabs({
  curriculum,
}: {
  curriculum: ProgrammeCurriculum;
}) {
  const [active, setActive] = useState(curriculum.stages[0]?.key ?? "");
  const stage =
    curriculum.stages.find((item) => item.key === active) ??
    curriculum.stages[0];

  if (!stage) return null;

  return (
    <Section
      id="curriculum"
      eyebrow={curriculum.eyebrow ?? "Curriculum"}
      title={curriculum.title ?? "What you will cover"}
    >
      <div
        role="tablist"
        aria-label="Course stages"
        className="flex flex-wrap gap-2 border-b border-[#bcd6dd]/60 pb-3"
      >
        {curriculum.stages.map((item) => {
          const selected = item.key === stage.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(item.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-foreground/5",
              )}
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-primary rounded-full border border-[#bcd6dd]/70 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.18em] uppercase">
            {stage.kind === "live" ? "Live" : "Self-paced"}
          </span>
          <span className="text-foreground/60 text-sm">{stage.label}</span>
        </div>

        <p className="text-foreground/85 mt-5 max-w-[62ch] text-[1.02rem] leading-relaxed">
          {stage.blurb}
        </p>
        {stage.formatNote ? (
          <p className="text-muted-foreground mt-3 max-w-[62ch] text-sm leading-relaxed">
            {stage.formatNote}
          </p>
        ) : null}

        <ol className="mt-10 space-y-8">
          {stage.items.map((item, index) => (
            <li
              key={item.title}
              className="grid gap-3 sm:grid-cols-[3rem_1fr] sm:gap-6"
            >
              <span className="water-accent font-display text-2xl leading-none tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="border-foreground/10 border-t pt-4">
                <h3 className="font-display text-foreground text-xl leading-snug">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mt-2 max-w-[62ch] text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
