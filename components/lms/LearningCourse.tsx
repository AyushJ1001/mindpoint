"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "@/lib/backend/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Download,
  ExternalLink,
  Lock,
  PlayCircle,
} from "lucide-react";
import {
  getLmsReleaseState,
  parseLmsLessonDescription,
  type LmsResource,
} from "@/lib/lms-content";

type Lesson = {
  key: string;
  title: string;
  notes: string;
  videoUrl?: string;
  releaseDate?: string;
  duration?: string;
  resources: LmsResource[];
};

function getVideoKind(url?: string) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
      return id ? { type: "iframe" as const, src: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? { type: "iframe" as const, src: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? { type: "iframe" as const, src: `https://player.vimeo.com/video/${id}` } : null;
    }
    if (parsed.hostname.includes("videodelivery.net")) {
      return { type: "iframe" as const, src: url };
    }
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(parsed.pathname + parsed.search)) {
      return { type: "video" as const, src: url };
    }
    return { type: "link" as const, src: url };
  } catch {
    return null;
  }
}

export default function LearningCourse({ courseId }: { courseId: string }) {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const enrollments = useQuery(
    api.myFunctions.getUserEnrollments,
    isAuthenticated ? { limit: 200 } : "skip",
  );

  const enrollment = useMemo(
    () =>
      enrollments?.find(
        (item) => item.course && String(item.course._id) === String(courseId),
      ),
    [courseId, enrollments],
  );
  const course = enrollment?.course;

  const lessons = useMemo<Lesson[]>(() => {
    if (!course) return [];
    if (course.modules && course.modules.length > 0) {
      return course.modules.map((module, index) => {
        const parsed = parseLmsLessonDescription(module.description);
        return {
          key: `${index}-${module.title}`,
          title: module.title,
          notes: parsed.notes,
          videoUrl: parsed.videoUrl,
          releaseDate: parsed.releaseDate,
          duration: parsed.duration,
          resources: parsed.resources,
        };
      });
    }

    const resources: LmsResource[] = course.fileUrl
      ? [{ label: "Course resource", url: course.fileUrl }]
      : [];
    if (course.content || resources.length > 0) {
      return [
        {
          key: "0-course-materials",
          title: "Course materials",
          notes: course.content || "Your course resources are available below.",
          resources,
        },
      ];
    }
    return [];
  }, [course]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const progressStorageKey = user
    ? `tmp-lms-progress:${user.id}:${courseId}`
    : `tmp-lms-progress:anonymous:${courseId}`;

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(progressStorageKey) || "[]");
      if (Array.isArray(saved)) {
        setCompletedKeys(saved.filter((value): value is string => typeof value === "string"));
      }
    } catch {
      setCompletedKeys([]);
    }
  }, [progressStorageKey, user]);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    window.localStorage.setItem(progressStorageKey, JSON.stringify(completedKeys));
  }, [completedKeys, progressStorageKey, user]);

  useEffect(() => {
    if (selectedIndex >= lessons.length && lessons.length > 0) {
      setSelectedIndex(lessons.length - 1);
    }
  }, [lessons.length, selectedIndex]);

  if (!user) {
    return (
      <div className="ss-page min-h-[70vh]">
        <div className="ss-wrap py-20">
          <h1 className="ss-heading-md">Sign in to continue learning.</h1>
          <p className="ss-lead mt-5">Your TMP learning space is connected to the account used for enrollment.</p>
        </div>
      </div>
    );
  }

  if (enrollments === undefined) {
    return (
      <div className="ss-page min-h-[70vh]">
        <div className="ss-wrap py-20 text-sm text-slate-500">Loading your course...</div>
      </div>
    );
  }

  if (!enrollment || !course) {
    return (
      <div className="ss-page min-h-[70vh]">
        <div className="ss-wrap py-20">
          <Lock className="h-9 w-9 text-[#0f4d4d]" />
          <h1 className="ss-heading-md mt-6">This course is not in your registrations.</h1>
          <p className="ss-lead mt-5">Course access is available only to the account attached to an active enrollment.</p>
          <Link href="/account" className="ss-link mt-8">Back to My Learning</Link>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="ss-page min-h-[70vh]">
        <div className="ss-wrap py-20">
          <BookOpen className="h-9 w-9 text-[#0f4d4d]" />
          <h1 className="ss-heading-md mt-6">Your learning space is being prepared.</h1>
          <p className="ss-lead mt-5">You are enrolled in {course.name}. Lessons will appear here as soon as TMP publishes them.</p>
          <Link href="/account" className="ss-link mt-8">Back to My Learning</Link>
        </div>
      </div>
    );
  }

  const lesson = lessons[selectedIndex];
  const release = getLmsReleaseState(lesson.releaseDate);
  const completed = completedKeys.includes(lesson.key);
  const completedCount = lessons.filter((item) => completedKeys.includes(item.key)).length;
  const progress = Math.round((completedCount / lessons.length) * 100);
  const video = getVideoKind(lesson.videoUrl);

  const toggleComplete = () => {
    if (release.locked) return;
    setCompletedKeys((current) =>
      current.includes(lesson.key)
        ? current.filter((key) => key !== lesson.key)
        : [...current, lesson.key],
    );
  };

  return (
    <div className="ss-page min-h-screen">
      <header className="border-b border-[rgba(22,63,61,0.18)]">
        <div className="ss-wrap py-8 md:py-10">
          <Link href="/account" className="ss-link">
            <ArrowLeft className="h-4 w-4" /> My Learning
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="ss-kicker">Enrollment {enrollment.enrollmentNumber}</p>
              <h1 className="ss-heading-md max-w-4xl">{course.name}</h1>
            </div>
            <div className="min-w-56">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{completedCount} of {lessons.length} complete</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden bg-[#dfe8e5]">
                <div className="h-full bg-[#0f4d4d] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="ss-wrap grid gap-0 border-x border-[rgba(22,63,61,0.18)] lg:grid-cols-[20rem_1fr]">
        <aside className="border-b border-[rgba(22,63,61,0.18)] lg:border-r lg:border-b-0">
          <div className="p-5 text-xs font-semibold tracking-[0.08em] text-[#0f4d4d]/65 lowercase">
            course lessons
          </div>
          <nav>
            {lessons.map((item, index) => {
              const itemRelease = getLmsReleaseState(item.releaseDate);
              const itemCompleted = completedKeys.includes(item.key);
              const active = index === selectedIndex;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`grid w-full grid-cols-[2rem_1fr_auto] gap-3 border-t border-[rgba(22,63,61,0.14)] px-5 py-4 text-left transition ${active ? "bg-[#eaf2ef]" : "hover:bg-[#eff4f1]"}`}
                >
                  <span className="font-display text-lg text-[#0f4d4d]/55">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-sm font-semibold text-[#163f3d]">{item.title}</span>
                    {item.duration && <span className="mt-1 block text-xs text-slate-500">{item.duration}</span>}
                  </span>
                  <span className="pt-0.5">
                    {itemRelease.locked ? <Lock className="h-4 w-4 text-slate-400" /> : itemCompleted ? <Check className="h-4 w-4 text-[#0f4d4d]" /> : null}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 p-6 md:p-10 lg:p-14">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Lesson {selectedIndex + 1} of {lessons.length}</span>
              {lesson.duration && (
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {lesson.duration}</span>
              )}
            </div>
            <h2 className="font-display mt-4 text-4xl font-medium leading-tight tracking-[-0.035em] text-[#163f3d] md:text-5xl">{lesson.title}</h2>

            {release.locked ? (
              <div className="mt-10 border-y border-[rgba(22,63,61,0.18)] py-10">
                <Lock className="h-8 w-8 text-[#0f4d4d]" />
                <h3 className="font-display mt-5 text-2xl font-medium">This lesson opens on {release.releaseAt?.toLocaleDateString()}.</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">You can continue with any earlier lessons while you wait.</p>
              </div>
            ) : (
              <>
                {video && (
                  <div className="mt-10 overflow-hidden border border-[rgba(22,63,61,0.18)] bg-black">
                    {video.type === "iframe" ? (
                      <div className="aspect-video">
                        <iframe
                          src={video.src}
                          title={`${lesson.title} video`}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : video.type === "video" ? (
                      <video controls preload="metadata" className="aspect-video w-full bg-black" src={video.src} />
                    ) : (
                      <a href={video.src} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#163f3d] px-6 py-5 text-sm font-semibold text-white">
                        <PlayCircle className="h-5 w-5" /> Open lesson video <ExternalLink className="ml-auto h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}

                {lesson.notes && (
                  <article className="prose prose-slate mt-10 max-w-none prose-headings:font-display prose-headings:font-medium prose-a:text-[#0f4d4d] prose-p:leading-8">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.notes}</ReactMarkdown>
                  </article>
                )}

                {lesson.resources.length > 0 && (
                  <section className="mt-12 border-t border-[rgba(22,63,61,0.18)] pt-8">
                    <p className="ss-kicker">lesson resources</p>
                    <div className="mt-5 divide-y divide-[rgba(22,63,61,0.14)] border-y border-[rgba(22,63,61,0.18)]">
                      {lesson.resources.map((resource) => (
                        <a key={`${resource.label}-${resource.url}`} href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-4 text-sm font-semibold text-[#163f3d] hover:text-[#0f4d4d]">
                          <Download className="h-4 w-4" /> {resource.label}
                          <ExternalLink className="ml-auto h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(22,63,61,0.18)] pt-8">
                  <Button type="button" variant={completed ? "outline" : "default"} onClick={toggleComplete}>
                    <Check /> {completed ? "Completed" : "Mark as complete"}
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setSelectedIndex((value) => Math.max(0, value - 1))} disabled={selectedIndex === 0}>
                      <ArrowLeft /> Previous
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setSelectedIndex((value) => Math.min(lessons.length - 1, value + 1))} disabled={selectedIndex === lessons.length - 1}>
                      Next <ArrowRight />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
