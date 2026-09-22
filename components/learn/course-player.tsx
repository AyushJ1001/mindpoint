"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SignInButton } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  Award,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  Lock,
  PlayCircle,
} from "lucide-react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { Button } from "@/components/ui/button";
import CourseQuiz from "@/components/learn/course-quiz";
import { resolveVideoEmbed } from "@/lib/video-embed";
import { cn } from "@/lib/utils";

type LearnerLesson = {
  _id: string;
  moduleTitle: string | null;
  title: string;
  description: string | null;
  kind: "video" | "pdf" | "link" | "text";
  contentUrl: string | null;
  textContent: string | null;
  durationMinutes: number | null;
  completed: boolean;
  locked: boolean;
};

function LessonBody({ lesson }: { lesson: LearnerLesson }) {
  if (lesson.kind === "text") {
    return (
      <div className="prose prose-slate max-w-none text-[0.95rem] leading-relaxed [&_p]:mb-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {lesson.textContent ?? ""}
        </ReactMarkdown>
      </div>
    );
  }

  const url = lesson.contentUrl ?? "";

  if (lesson.kind === "video") {
    const embed = resolveVideoEmbed(url);
    if (embed.type === "iframe") {
      return (
        <div className="bg-muted aspect-video w-full overflow-hidden rounded-xl">
          <iframe
            src={embed.src}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      );
    }
    if (embed.type === "video") {
      return (
        <video src={embed.src} controls className="w-full rounded-xl" />
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-primary inline-flex items-center gap-2 text-sm font-medium underline"
      >
        Open video <ExternalLink className="h-4 w-4" />
      </a>
    );
  }

  if (lesson.kind === "pdf") {
    return (
      <div className="space-y-3">
        <iframe
          src={url}
          title={lesson.title}
          className="border-border h-[70vh] w-full rounded-xl border"
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-primary inline-flex items-center gap-2 text-sm font-medium underline"
        >
          Open PDF in a new tab <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="border-border bg-card inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium"
    >
      Open resource <ExternalLink className="h-4 w-4" />
    </a>
  );
}

export default function CoursePlayer({ courseId }: { courseId: string }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const id = courseId as Id<"courses">;
  const data = useQuery(
    api.lms.listCourseLessons,
    isAuthenticated ? { courseId: id } : "skip",
  );
  const setComplete = useMutation(api.lms.setLessonComplete);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.allowed) return;
    if (activeId && data.lessons.some((lesson) => lesson._id === activeId)) {
      return;
    }
    const firstIncomplete = data.lessons.find((lesson) => !lesson.completed);
    setActiveId((firstIncomplete ?? data.lessons[0])?._id ?? null);
  }, [data, activeId]);

  const groups = useMemo(() => {
    const map = new Map<string, LearnerLesson[]>();
    for (const lesson of (data?.lessons ?? []) as LearnerLesson[]) {
      const key = lesson.moduleTitle ?? "Lessons";
      const list = map.get(key) ?? [];
      list.push(lesson);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [data]);

  const active =
    ((data?.lessons ?? []) as LearnerLesson[]).find(
      (lesson) => lesson._id === activeId,
    ) ?? null;

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
        <h2 className="font-display text-2xl">Sign in to open this course</h2>
        <SignInButton mode="modal">
          <Button className="mt-6">Sign in</Button>
        </SignInButton>
      </div>
    );
  }

  if (data === undefined) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (!data.allowed) {
    const pending = data.reason === "pending_verification";
    const notEnrolled = data.reason === "not_enrolled";
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
        <h2 className="font-display text-2xl">
          {pending
            ? "Payment verification pending"
            : notEnrolled
              ? "You're not enrolled in this course"
              : "This course is not available"}
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          {pending
            ? "We're verifying your payment. Lessons unlock as soon as it's approved — you'll get an email if anything else is needed."
            : data.courseName
              ? `Enrol in “${data.courseName}” to unlock its lessons.`
              : "Enrol in a course to unlock its lessons."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    );
  }

  if (data.lessons.length === 0) {
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
        <h2 className="font-display text-2xl">
          {data.courseName ?? "This course"}
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          Lessons are still being added. Check back soon.
        </p>
      </div>
    );
  }

  const percent =
    data.totalCount > 0
      ? Math.round((data.completedCount / data.totalCount) * 100)
      : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-6">
        <div>
          <Link
            href="/learn"
            className="text-muted-foreground hover:text-foreground text-xs tracking-[0.16em] uppercase"
          >
            ← My learning
          </Link>
          <h1 className="font-display mt-2 text-2xl leading-snug">
            {data.courseName}
          </h1>
          <div className="bg-secondary mt-4 h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-muted-foreground mt-1.5 text-xs">
            {data.completedCount} of {data.totalCount} complete · {percent}%
          </p>
          {data.totalCount > 0 && data.completedCount === data.totalCount && (
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link href={`/learn/${courseId}/certificate`}>
                <Award className="mr-2 h-4 w-4" />
                View certificate
              </Link>
            </Button>
          )}
          {data.sequentialModules && (
            <p className="text-muted-foreground mt-2 text-xs">
              Modules unlock in order.
            </p>
          )}
        </div>

        <nav className="space-y-5">
          {groups.map(([moduleTitle, lessons]) => (
            <div key={moduleTitle}>
              <p className="text-muted-foreground mb-2 text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
                {moduleTitle}
              </p>
              <ul className="space-y-1">
                {lessons.map((lesson) => {
                  const isActive = lesson._id === activeId;
                  return (
                    <li key={lesson._id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (lesson.locked) return;
                          setActiveId(lesson._id);
                        }}
                        disabled={lesson.locked}
                        className={cn(
                          "flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-foreground/75 hover:bg-secondary/60",
                          lesson.locked && "cursor-not-allowed opacity-50",
                        )}
                      >
                        {lesson.locked ? (
                          <Lock className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                        ) : lesson.completed ? (
                          <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                        ) : (
                          <Circle className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                        )}
                        <span className="leading-snug">{lesson.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="min-w-0">
        {active ? (
          <article className="space-y-5">
            <header>
              <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-[0.16em] uppercase">
                {active.kind === "video" ? (
                  <PlayCircle className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {active.kind}
                {active.durationMinutes ? ` · ${active.durationMinutes} min` : ""}
              </div>
              <h2 className="font-display mt-2 text-2xl leading-snug">
                {active.title}
              </h2>
              {active.description && (
                <p className="text-muted-foreground mt-2 text-sm">
                  {active.description}
                </p>
              )}
            </header>

            <LessonBody lesson={active} />

            <div className="border-border flex items-center justify-between border-t pt-5">
              <Button
                type="button"
                variant={active.completed ? "outline" : "default"}
                onClick={() =>
                  setComplete({
                    lessonId: active._id as Id<"lessons">,
                    completed: !active.completed,
                  })
                }
              >
                {active.completed ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completed — mark as not done
                  </>
                ) : (
                  "Mark as complete"
                )}
              </Button>
            </div>
          </article>
        ) : null}
        <CourseQuiz courseId={courseId} />
      </main>
    </div>
  );
}
