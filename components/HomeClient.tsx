"use client";

import { Clock } from "lucide-react";
import { UpcomingCourseCard } from "./course-card";
import { Doc } from "@/convex/_generated/dataModel";

interface HomeClientProps {
  upcomingCourses: Doc<"courses">[];
}

export default function HomeClient({ upcomingCourses }: HomeClientProps) {
  return (
    <>
      {/* Upcoming Courses */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Upcoming Courses
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              {upcomingCourses && upcomingCourses.length > 0
                ? "Don't miss out on these exciting courses starting soon. Secure your spot today!"
                : "We are currently working on our upcoming courses. Stay tuned for more information."}
            </p>
          </div>

          {upcomingCourses && upcomingCourses.length > 0 ? (
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              {upcomingCourses.map((course) => (
                <UpcomingCourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
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
