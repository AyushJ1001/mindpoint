"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, BookOpen, Plus, Save, Trash2 } from "lucide-react";
import { assertConvexSuccess, getUserFacingErrorMessage } from "@/lib/convex-error";
import {
  parseLmsLessonDescription,
  parseResourcesText,
  resourcesToText,
  serializeLmsLessonDescription,
} from "@/lib/lms-content";

type LessonDraft = {
  title: string;
  notes: string;
  videoUrl: string;
  duration: string;
  releaseDate: string;
  resourcesText: string;
};

function emptyLesson(): LessonDraft {
  return {
    title: "",
    notes: "",
    videoUrl: "",
    duration: "",
    releaseDate: "",
    resourcesText: "",
  };
}

function toLessonDraft(module: { title: string; description: string }): LessonDraft {
  const parsed = parseLmsLessonDescription(module.description);
  return {
    title: module.title,
    notes: parsed.notes,
    videoUrl: parsed.videoUrl ?? "",
    duration: parsed.duration ?? "",
    releaseDate: parsed.releaseDate ?? "",
    resourcesText: resourcesToText(parsed.resources),
  };
}

export default function AdminLmsPage() {
  const courses = useQuery(api.adminCourses.listCourses, { limit: 500 });
  const updateCourse = useMutation(api.adminCourses.updateCourse);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lessons, setLessons] = useState<LessonDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const selectedCourse = useMemo(
    () => courses?.find((course) => String(course._id) === selectedCourseId),
    [courses, selectedCourseId],
  );

  useEffect(() => {
    if (!selectedCourseId && courses && courses.length > 0) {
      setSelectedCourseId(String(courses[0]._id));
    }
  }, [courses, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourse) {
      setLessons([]);
      return;
    }
    setLessons((selectedCourse.modules ?? []).map(toLessonDraft));
  }, [selectedCourse]);

  const updateLesson = (index: number, patch: Partial<LessonDraft>) => {
    setLessons((current) =>
      current.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, ...patch } : lesson,
      ),
    );
  };

  const moveLesson = (index: number, direction: -1 | 1) => {
    setLessons((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [lesson] = next.splice(index, 1);
      next.splice(nextIndex, 0, lesson);
      return next;
    });
  };

  const save = async () => {
    if (!selectedCourse) return;
    const validLessons = lessons.filter((lesson) => lesson.title.trim());
    setIsSaving(true);
    try {
      const result = await updateCourse({
        courseId: selectedCourse._id as Id<"courses">,
        patch: {
          modules: validLessons.map((lesson) => ({
            title: lesson.title.trim(),
            description: serializeLmsLessonDescription({
              notes: lesson.notes,
              videoUrl: lesson.videoUrl,
              duration: lesson.duration,
              releaseDate: lesson.releaseDate,
              resources: parseResourcesText(lesson.resourcesText),
            }),
          })),
        },
      });
      assertConvexSuccess(result, "Could not save LMS lessons");
      toast.success("LMS lessons saved");
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, "Could not save LMS lessons"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-sm font-semibold tracking-wide text-teal-700 uppercase">
          Student learning
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">LMS Content Manager</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Build the lessons students see after enrollment. This first version uses each course&apos;s existing module records, so it works without changing the checkout or enrollment system.
        </p>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <Label htmlFor="lms-course">Course</Label>
        <select
          id="lms-course"
          value={selectedCourseId}
          onChange={(event) => setSelectedCourseId(event.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm md:max-w-xl"
        >
          {courses?.map((course) => (
            <option key={course._id} value={String(course._id)}>
              {course.name} {course.type ? `· ${course.type}` : ""}
            </option>
          ))}
        </select>
        {selectedCourse && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
            <span>Code: {selectedCourse.code}</span>
            <span>•</span>
            <span>{lessons.length} lesson{lessons.length === 1 ? "" : "s"}</span>
          </div>
        )}
      </section>

      <div className="space-y-5">
        {lessons.map((lesson, index) => (
          <section key={`${index}-${lesson.title}`} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className="mr-auto flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-800">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-slate-700">Lesson {index + 1}</span>
              </div>
              <Button type="button" variant="outline" size="icon-sm" onClick={() => moveLesson(index, -1)} disabled={index === 0} aria-label="Move lesson up">
                <ArrowUp />
              </Button>
              <Button type="button" variant="outline" size="icon-sm" onClick={() => moveLesson(index, 1)} disabled={index === lessons.length - 1} aria-label="Move lesson down">
                <ArrowDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setLessons((current) => current.filter((_, lessonIndex) => lessonIndex !== index))}
                aria-label="Delete lesson"
              >
                <Trash2 />
              </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Lesson title</Label>
                <Input value={lesson.title} onChange={(event) => updateLesson(index, { title: event.target.value })} placeholder="e.g. Understanding the Inner Child" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Lesson notes / explanation</Label>
                <Textarea
                  value={lesson.notes}
                  onChange={(event) => updateLesson(index, { notes: event.target.value })}
                  placeholder="Explain the lesson, instructions, key ideas, exercises, or anything students should read."
                  className="min-h-36"
                />
              </div>

              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input value={lesson.videoUrl} onChange={(event) => updateLesson(index, { videoUrl: event.target.value })} placeholder="https://..." />
                <p className="text-xs text-slate-500">YouTube, Vimeo, Cloudflare iframe, or a direct MP4 link can be used in this preview version.</p>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Input value={lesson.duration} onChange={(event) => updateLesson(index, { duration: event.target.value })} placeholder="e.g. 45 min" />
              </div>

              <div className="space-y-2">
                <Label>Release date (optional)</Label>
                <Input type="date" value={lesson.releaseDate} onChange={(event) => updateLesson(index, { releaseDate: event.target.value })} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Resources</Label>
                <Textarea
                  value={lesson.resourcesText}
                  onChange={(event) => updateLesson(index, { resourcesText: event.target.value })}
                  placeholder={"Workbook | https://example.com/workbook.pdf\nSlides | https://example.com/slides.pdf"}
                  className="min-h-28 font-mono text-sm"
                />
                <p className="text-xs text-slate-500">One resource per line: Name | URL</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      {selectedCourse && lessons.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-lg font-semibold">No LMS lessons yet</h2>
          <p className="mt-2 text-sm text-slate-500">Add the first lesson for {selectedCourse.name}.</p>
        </div>
      )}

      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur">
        <Button type="button" variant="outline" onClick={() => setLessons((current) => [...current, emptyLesson()])} disabled={!selectedCourse}>
          <Plus /> Add lesson
        </Button>
        <Button type="button" onClick={save} disabled={!selectedCourse || isSaving}>
          <Save /> {isSaving ? "Saving..." : "Save LMS"}
        </Button>
      </div>
    </div>
  );
}
