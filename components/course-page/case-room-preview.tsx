"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { ContentPlaceholder } from "@/components/course-page/placeholder";
import { cn } from "@/lib/utils";
import type { CaseRoomExercise } from "@/lib/course-content/types";

function ExerciseCard({ exercise }: { exercise: CaseRoomExercise }) {
  const [selected, setSelected] = useState<number | null>(null);
  const hasOptions = Boolean(exercise.options && exercise.options.length > 0);
  const answered = selected !== null;
  const isCorrect =
    hasOptions && exercise.correctIndex !== undefined
      ? selected === exercise.correctIndex
      : null;

  return (
    <div className="water-glass rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl text-[#f1ece0]">
          {exercise.title}
        </h3>
        {exercise.sample ? (
          <span className="rounded-full border border-[#bcd6dd]/35 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-[#8ad6ca] uppercase">
            Illustrative sample
          </span>
        ) : null}
      </div>

      <blockquote className="font-display mt-5 border-l-2 border-[#8ad6ca]/50 pl-5 text-xl leading-relaxed text-[#f1ece0]/90 italic">
        {exercise.prompt}
      </blockquote>

      {hasOptions ? (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {exercise.options!.map((option, index) => {
              const isSelected = selected === index;
              const isCorrectOption = index === exercise.correctIndex;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={answered}
                  onClick={() => setSelected(index)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    !answered &&
                      "border-[#bcd6dd]/40 text-[#f1ece0] hover:border-[#8ad6ca] hover:text-[#8ad6ca]",
                    answered &&
                      isCorrectOption &&
                      "border-[#8ad6ca] bg-[#8ad6ca]/15 font-medium text-[#8ad6ca]",
                    answered &&
                      isSelected &&
                      !isCorrectOption &&
                      "border-red-300/60 bg-red-500/15 text-red-200",
                    answered &&
                      !isSelected &&
                      !isCorrectOption &&
                      "border-[#bcd6dd]/20 text-[#f1ece0]/45",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {answered && exercise.explanation ? (
            <div className="mt-6 border-t border-[#bcd6dd]/25 pt-5">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-[#f1ece0]/90">
                {isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8ad6ca]" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                )}
                <span>{exercise.explanation}</span>
              </p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#8ad6ca] hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Try again
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function CaseRoomPreview({
  exercises,
}: {
  exercises: CaseRoomExercise[];
}) {
  return (
    <section
      id="case-room"
      className="water-band-deep water-on-deep relative scroll-mt-24 overflow-hidden py-16 sm:py-24"
    >
      <Image
        src="/coastal/shore.jpg"
        alt="A quiet shoreline at sunrise, seen from the water's edge."
        fill
        sizes="100vw"
        className="water-drift object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f2a28]/85 via-[#123a37]/80 to-[#1d4e4a]/85" />

      <div className="relative mx-auto w-full max-w-3xl px-5 sm:px-6">
        <p className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
          Inside the Case Room
        </p>
        <h2 className="font-display mt-4 max-w-[24ch] text-3xl leading-[1.1] tracking-[-0.02em] sm:text-4xl">
          Work with real material, safely.
        </h2>
        <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-[#f1ece0]/80 sm:text-lg">
          The Case Room is where you bring a framework to a case and see how it
          behaves, before it matters. Take a look at one.
        </p>

        <div className="mt-10 grid gap-6">
          {exercises.length > 0 ? (
            exercises.map((exercise) => (
              <ExerciseCard key={exercise.title} exercise={exercise} />
            ))
          ) : (
            <ContentPlaceholder label="Case Room exercises for this programme have not been supplied yet. Add them in the admin so students can preview one here." />
          )}
        </div>
      </div>
    </section>
  );
}
