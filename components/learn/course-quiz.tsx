"use client";

import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitResult {
  score: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  results: {
    questionId: string;
    selectedIndex: number;
    correctIndex: number;
    correct: boolean;
  }[];
}

export default function CourseQuiz({ courseId }: { courseId: string }) {
  const id = courseId as Id<"courses">;
  const { isAuthenticated } = useConvexAuth();
  const data = useQuery(
    api.quizzes.getCourseQuiz,
    isAuthenticated ? { courseId: id } : "skip",
  );
  const submit = useMutation(api.quizzes.submitQuizAttempt);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (data === undefined || !data.allowed || !data.quiz) return null;
  const { quiz, questions } = data;
  const answeredAll = questions.every(
    (question) => answers[question._id] !== undefined,
  );
  const resultByQuestion = new Map(
    (result?.results ?? []).map((entry) => [entry.questionId, entry]),
  );
  const passed = result?.passed ?? data.passed;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const response = await submit({
        courseId: id,
        answers: questions.map((question) => ({
          questionId: question._id as Id<"quizQuestions">,
          selectedIndex: answers[question._id] ?? -1,
        })),
      });
      setResult(response);
      if (response.passed) {
        toast.success(`Passed with ${response.score}%`);
      } else {
        toast.error(
          `Scored ${response.score}% — the pass mark is ${quiz.passingScore}%`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not submit quiz",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setAnswers({});
    setResult(null);
  }

  return (
    <section className="border-border bg-card mt-10 rounded-2xl border p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-muted-foreground mt-1 text-sm">
              {quiz.description}
            </p>
          )}
          <p className="text-muted-foreground mt-1 text-xs">
            {questions.length} question{questions.length === 1 ? "" : "s"} · pass
            mark {quiz.passingScore}%
          </p>
        </div>
        {passed && (
          <span className="text-primary inline-flex items-center gap-1.5 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Passed
          </span>
        )}
      </header>

      <ol className="mt-6 space-y-6">
        {questions.map((question, index) => {
          const entry = resultByQuestion.get(question._id);
          return (
            <li key={question._id}>
              <p className="text-foreground flex items-start gap-2 text-sm font-medium">
                {entry ? (
                  entry.correct ? (
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  )
                ) : (
                  <span className="text-muted-foreground">{index + 1}.</span>
                )}
                {question.prompt}
              </p>
              <div className="mt-3 space-y-2 pl-6">
                {question.options.map((option, optionIndex) => {
                  const selected = answers[question._id] === optionIndex;
                  const isCorrect = entry?.correctIndex === optionIndex;
                  return (
                    <label
                      key={optionIndex}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                        entry && isCorrect
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary/60",
                        entry && selected && !entry.correct
                          ? "border-red-300"
                          : "",
                      )}
                    >
                      <input
                        type="radio"
                        name={`q-${question._id}`}
                        checked={selected}
                        disabled={Boolean(result)}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question._id]: optionIndex,
                          }))
                        }
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {result ? (
          <>
            <p
              className={cn(
                "text-sm font-medium",
                result.passed ? "text-primary" : "text-red-600",
              )}
            >
              You scored {result.score}% ({result.correctCount}/
              {result.totalCount} correct).
            </p>
            <Button type="button" variant="outline" onClick={reset}>
              Try again
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!answeredAll || submitting}
          >
            {submitting ? "Submitting…" : "Submit answers"}
          </Button>
        )}
        {data.bestAttempt && !result && (
          <p className="text-muted-foreground text-xs">
            Best attempt: {data.bestAttempt.score}%
          </p>
        )}
      </div>
    </section>
  );
}
