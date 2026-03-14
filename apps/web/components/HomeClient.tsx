"use client";

import { Clock } from "lucide-react";
import { UpcomingCourseCard } from "./course-card";
import { Doc } from "@mindpoint/backend/data-model";

interface HomeClientProps {
  upcomingCourses: Doc<"courses">[];
}

export default function HomeClient({ upcomingCourses }: HomeClientProps) {
  return (
    <>
      {/* Upcoming Courses */}
      <section className="section-padding relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-white to-blue-50/70 dark:from-slate-950 dark:via-blue-950/65 dark:to-slate-950" />
        <div className="container">
          <div className="relative z-10 mb-12 text-center">
            <h2 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Upcoming Courses
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              {upcomingCourses && upcomingCourses.length > 0
                ? "Don't miss out on these exciting courses starting soon. Secure your spot today!"
                : "We are currently working on our upcoming courses. Stay tuned for more information."}
            </p>
          </div>

          {upcomingCourses && upcomingCourses.length > 0 ? (
            <div className="relative z-10 mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              {upcomingCourses.map((course) => (
                <UpcomingCourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="relative z-10 py-12 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30">
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                No upcoming courses at the moment
              </h3>
              <p className="text-muted-foreground">
                We&apos;re working on new courses. Check back soon or explore
                our current offerings!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
