"use client";

import Link from "next/link";
import Image from "next/image";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { ArrowRight, Award, BookOpen, ExternalLink, Video } from "lucide-react";

import { api } from "@/lib/backend/api";
import { Button } from "@/components/ui/button";

function ProgressBar({ value, total }: { value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-muted-foreground text-xs">
        {total > 0
          ? `${value} of ${total} lessons complete · ${percent}%`
          : "Lessons are being added"}
      </p>
    </div>
  );
}

export default function LearnDashboard() {
  const { user } = useUser();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const learning = useQuery(
    api.lms.getMyLearning,
    isAuthenticated ? {} : "skip",
  );
  const sessions = useQuery(
    api.lms.getMyLiveSessions,
    isAuthenticated ? {} : "skip",
  );

  if (authLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
        <BookOpen className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
        <h2 className="font-display text-2xl">Sign in to see your learning</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          {user
            ? `Signed in as ${user.primaryEmailAddress?.emailAddress ?? user.id}.`
            : "Your enrolled courses and their lessons will appear here."}
        </p>
        <SignInButton mode="modal">
          <Button className="mt-6">Sign in</Button>
        </SignInButton>
      </div>
    );
  }

  if (learning === undefined) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (learning.length === 0 && (sessions?.length ?? 0) === 0) {
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
        <BookOpen className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
        <h2 className="font-display text-2xl">No courses yet</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          Once you enrol in a course, its lessons will show up here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {sessions && sessions.length > 0 && (
        <section>
          <h2 className="font-display mb-5 text-xl">Live sessions</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {sessions.map((session) => (
              <div
                key={session.batchId}
                className="border-border bg-card rounded-2xl border p-5"
              >
                <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
                  {session.courseName}
                </p>
                <h3 className="font-display mt-2 text-lg">
                  {session.batchLabel}
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {session.daysOfWeek.join(", ")} · {session.startTime}–
                  {session.endTime}
                </p>
                <p className="text-muted-foreground text-xs">
                  {session.startDate} → {session.endDate}
                </p>
                {session.meetingNote && (
                  <p className="text-muted-foreground mt-3 text-sm italic">
                    {session.meetingNote}
                  </p>
                )}
                {session.meetingUrl ? (
                  <Button asChild className="mt-4 w-full">
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Join session
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                ) : (
                  <p className="text-muted-foreground mt-4 text-xs">
                    The join link will appear here before the first class.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {learning.length > 0 && (
        <section>
          <h2 className="font-display mb-5 text-xl">Courses</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {learning.map((item) => (
              <div
                key={item.courseId}
                className="border-border bg-card flex flex-col overflow-hidden rounded-2xl border"
              >
                <div className="bg-muted relative h-40 w-full">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <h3 className="font-display text-lg leading-snug">
                      {item.courseName}
                    </h3>
                  </div>
                  <div className="mt-auto space-y-4">
                    <ProgressBar
                      value={item.completedLessons}
                      total={item.totalLessons}
                    />
                    <Button asChild className="w-full">
                      <Link href={`/learn/${item.courseId}`}>
                        {item.completedLessons > 0 ? "Continue" : "Start learning"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    {item.totalLessons > 0 &&
                      item.completedLessons === item.totalLessons && (
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/learn/${item.courseId}/certificate`}>
                            <Award className="mr-2 h-4 w-4" />
                            Certificate
                          </Link>
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
