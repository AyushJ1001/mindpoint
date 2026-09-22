"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Kind = "video" | "pdf" | "link" | "text";

interface FormState {
  title: string;
  moduleTitle: string;
  kind: Kind;
  contentUrl: string;
  textContent: string;
  durationMinutes: string;
  isPublished: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  moduleTitle: "",
  kind: "video",
  contentUrl: "",
  textContent: "",
  durationMinutes: "",
  isPublished: true,
};

const KIND_LABELS: Record<Kind, string> = {
  video: "Video",
  pdf: "PDF",
  link: "Link",
  text: "Text",
};

export default function LessonManager({ courseId }: { courseId: string }) {
  const id = courseId as Id<"courses">;
  const lessons = useQuery(api.lms.listLessonsForAdmin, { courseId: id });
  const createLesson = useMutation(api.lms.createLesson);
  const updateLesson = useMutation(api.lms.updateLesson);
  const deleteLesson = useMutation(api.lms.deleteLesson);
  const reorderLessons = useMutation(api.lms.reorderLessons);
  const settings = useQuery(api.lms.getLmsSettings, { courseId: id });
  const setSettings = useMutation(api.lms.setLmsSettings);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  async function handleSubmit() {
    if (!form.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    setSaving(true);
    try {
      const duration = form.durationMinutes.trim()
        ? Number(form.durationMinutes)
        : undefined;
      const payload = {
        title: form.title,
        moduleTitle: form.moduleTitle || undefined,
        kind: form.kind,
        contentUrl:
          form.kind === "text" ? undefined : form.contentUrl || undefined,
        textContent: form.kind === "text" ? form.textContent : undefined,
        durationMinutes: duration,
        isPublished: form.isPublished,
      };
      if (editingId) {
        await updateLesson({
          lessonId: editingId as Id<"lessons">,
          ...payload,
        });
        toast.success("Lesson updated");
      } else {
        await createLesson({ courseId: id, ...payload });
        toast.success("Lesson added");
      }
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save lesson",
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(lesson: NonNullable<typeof lessons>[number]) {
    setEditingId(lesson._id);
    setForm({
      title: lesson.title,
      moduleTitle: lesson.moduleTitle ?? "",
      kind: lesson.kind,
      contentUrl: lesson.contentUrl ?? "",
      textContent: lesson.textContent ?? "",
      durationMinutes:
        lesson.durationMinutes != null ? String(lesson.durationMinutes) : "",
      isPublished: lesson.isPublished,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(lessonId: string, title: string) {
    if (!window.confirm(`Delete lesson “${title}”? This also removes progress.`))
      return;
    try {
      await deleteLesson({ lessonId: lessonId as Id<"lessons"> });
      toast.success("Lesson deleted");
      if (editingId === lessonId) resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete lesson",
      );
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!lessons) return;
    const target = index + direction;
    if (target < 0 || target >= lessons.length) return;
    const ordered = lessons.map((lesson) => lesson._id);
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    try {
      await reorderLessons({ courseId: id, orderedLessonIds: ordered });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reorder lessons",
      );
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning settings</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={settings?.sequentialModules ?? false}
              disabled={settings === undefined}
              onChange={async (event) => {
                try {
                  await setSettings({
                    courseId: id,
                    sequentialModules: event.target.checked,
                  });
                  toast.success(
                    event.target.checked
                      ? "Modules will unlock in order"
                      : "All modules unlocked",
                  );
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Could not update settings",
                  );
                }
              }}
            />
            <span>
              Require modules in order
              <span className="block text-xs text-slate-500">
                Learners must finish every lesson in a module before the next
                module unlocks.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit lesson" : "Add a lesson"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Title
              </label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="e.g. The cognitive model"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Module / section (optional)
              </label>
              <Input
                value={form.moduleTitle}
                onChange={(event) =>
                  setForm({ ...form, moduleTitle: event.target.value })
                }
                placeholder="e.g. Week 1 — Foundations"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Lesson type
              </label>
              <select
                value={form.kind}
                onChange={(event) =>
                  setForm({ ...form, kind: event.target.value as Kind })
                }
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              >
                {(Object.keys(KIND_LABELS) as Kind[]).map((kind) => (
                  <option key={kind} value={kind}>
                    {KIND_LABELS[kind]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Duration in minutes (optional)
              </label>
              <Input
                inputMode="numeric"
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm({ ...form, durationMinutes: event.target.value })
                }
                placeholder="e.g. 12"
              />
            </div>
          </div>

          {form.kind === "text" ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Lesson body (Markdown supported)
              </label>
              <Textarea
                rows={6}
                value={form.textContent}
                onChange={(event) =>
                  setForm({ ...form, textContent: event.target.value })
                }
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                {form.kind === "video"
                  ? "Video URL (YouTube, Vimeo or .mp4)"
                  : form.kind === "pdf"
                    ? "PDF URL"
                    : "Resource URL"}
              </label>
              <Input
                value={form.contentUrl}
                onChange={(event) =>
                  setForm({ ...form, contentUrl: event.target.value })
                }
                placeholder="https://…"
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                setForm({ ...form, isPublished: event.target.checked })
              }
            />
            Visible to learners
          </label>

          <div className="flex gap-2">
            <Button type="button" onClick={handleSubmit} disabled={saving}>
              <Plus className="mr-2 h-4 w-4" />
              {editingId ? "Save changes" : "Add lesson"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Lessons {lessons ? `(${lessons.length})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessons === undefined ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : lessons.length === 0 ? (
            <p className="text-sm text-slate-500">
              No lessons yet. Add the first one above.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {lessons.map((lesson, index) => (
                <li
                  key={lesson._id}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex flex-col">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label="Move down"
                      disabled={index === lessons.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {lesson.title}
                      </span>
                      <Badge variant="secondary">
                        {KIND_LABELS[lesson.kind]}
                      </Badge>
                      {!lesson.isPublished && (
                        <Badge variant="outline">Hidden</Badge>
                      )}
                    </div>
                    {lesson.moduleTitle && (
                      <p className="text-muted-foreground truncate text-xs">
                        {lesson.moduleTitle}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Edit lesson"
                    onClick={() => startEdit(lesson)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Delete lesson"
                    onClick={() => handleDelete(lesson._id, lesson.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
