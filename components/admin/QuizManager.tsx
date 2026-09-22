"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface QuestionDraft {
  _id?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function QuizManager({ courseId }: { courseId: string }) {
  const id = courseId as Id<"courses">;
  const data = useQuery(api.quizzes.getQuizForAdmin, { courseId: id });
  const saveQuiz = useMutation(api.quizzes.saveQuiz);
  const deleteQuiz = useMutation(api.quizzes.deleteQuiz);

  const [title, setTitle] = useState("Course quiz");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [isPublished, setIsPublished] = useState(true);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data === undefined || initialized) return;
    if (data) {
      setTitle(data.quiz.title);
      setDescription(data.quiz.description ?? "");
      setPassingScore(data.quiz.passingScore);
      setIsPublished(data.quiz.isPublished);
      setQuestions(
        data.questions.map((question) => ({
          _id: question._id,
          prompt: question.prompt,
          options: question.options,
          correctIndex: question.correctIndex,
          explanation: question.explanation ?? "",
        })),
      );
    }
    setInitialized(true);
  }, [data, initialized]);

  const updateQuestion = (index: number, patch: Partial<QuestionDraft>) => {
    setQuestions((current) =>
      current.map((question, i) =>
        i === index ? { ...question, ...patch } : question,
      ),
    );
  };

  async function handleSave() {
    setSaving(true);
    try {
      await saveQuiz({
        courseId: id,
        title,
        description: description || undefined,
        passingScore,
        isPublished,
        questions: questions.map((question) => ({
          _id: question._id as Id<"quizQuestions"> | undefined,
          prompt: question.prompt,
          options: question.options,
          correctIndex: question.correctIndex,
          explanation: question.explanation || undefined,
        })),
      });
      toast.success("Quiz saved");
      setInitialized(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save quiz",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this quiz and all its questions?")) return;
    try {
      await deleteQuiz({ courseId: id });
      setTitle("Course quiz");
      setDescription("");
      setPassingScore(70);
      setIsPublished(true);
      setQuestions([]);
      setInitialized(false);
      toast.success("Quiz deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete quiz",
      );
    }
  }

  if (data === undefined) {
    return <p className="text-sm text-slate-500">Loading quiz…</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Title
              </label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Passing score (%)
              </label>
              <Input
                inputMode="numeric"
                value={String(passingScore)}
                onChange={(event) =>
                  setPassingScore(Number(event.target.value) || 0)
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Description (optional)
            </label>
            <Textarea
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
            />
            Published (visible to learners; required for the certificate)
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Questions ({questions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question._id ?? `new-${index}`}
              className="space-y-3 rounded-md border border-slate-200 p-4"
            >
              <div className="flex items-start gap-2">
                <span className="mt-2 text-xs font-semibold text-slate-500">
                  Q{index + 1}
                </span>
                <Textarea
                  rows={2}
                  placeholder="Question prompt"
                  value={question.prompt}
                  onChange={(event) =>
                    updateQuestion(index, { prompt: event.target.value })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove question"
                  onClick={() =>
                    setQuestions((current) =>
                      current.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 pl-7">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={question.correctIndex === optionIndex}
                      onChange={() =>
                        updateQuestion(index, { correctIndex: optionIndex })
                      }
                      aria-label={`Mark option ${optionIndex + 1} correct`}
                    />
                    <Input
                      value={option}
                      placeholder={`Option ${optionIndex + 1}`}
                      onChange={(event) => {
                        const options = [...question.options];
                        options[optionIndex] = event.target.value;
                        updateQuestion(index, { options });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove option"
                      disabled={question.options.length <= 2}
                      onClick={() => {
                        const options = question.options.filter(
                          (_, i) => i !== optionIndex,
                        );
                        updateQuestion(index, {
                          options,
                          correctIndex: Math.min(
                            question.correctIndex,
                            options.length - 1,
                          ),
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateQuestion(index, {
                      options: [...question.options, ""],
                    })
                  }
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add option
                </Button>
                <Input
                  value={question.explanation}
                  placeholder="Explanation shown after answering (optional)"
                  onChange={(event) =>
                    updateQuestion(index, { explanation: event.target.value })
                  }
                />
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setQuestions((current) => [
                  ...current,
                  {
                    prompt: "",
                    options: ["", ""],
                    correctIndex: 0,
                    explanation: "",
                  },
                ])
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add question
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save quiz"}
            </Button>
            {data && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete quiz
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-500">
            The radio button marks the correct answer. Learners only pass the
            quiz — and unlock their certificate — when they meet the passing
            score.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
