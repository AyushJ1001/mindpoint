import { Clock, ArrowRight } from "lucide-react";
import { UpcomingCourseCard } from "@/components/course-card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { PublicCourse } from "@mindpoint/backend";

interface CoursePreviewSectionProps {
  upcomingCourses: PublicCourse[];
}

export default function CoursePreviewSection({
  upcomingCourses,
}: CoursePreviewSectionProps) {
  return (
    <section className="home-section-md">
      <div className="container">
        <ScrollReveal>
          <div className="home-shell-soft mx-auto max-w-6xl px-6 py-7 sm:px-8 sm:py-8">
            <div className="mb-10 flex flex-col gap-4 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
              <div className="max-w-2xl">
                <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                  What&apos;s coming up
                </span>
                <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Programs you can step into next
                </h2>
                <p className="text-muted-foreground mt-3 text-lg">
                  A smaller, more useful preview of what&apos;s starting soon.
                </p>
              </div>
              <Button
                variant="outline"
                asChild
                className="self-center lg:self-auto"
              >
                <Link href="/courses">
                  Browse all courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {upcomingCourses && upcomingCourses.length > 0 ? (
              <ScrollReveal>
                <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                  {upcomingCourses.map((course) => (
                    <UpcomingCourseCard key={course._id} course={course} />
                  ))}
                </div>
              </ScrollReveal>
            ) : (
              <ScrollReveal>
                <div className="py-10 text-center">
                  <div className="bg-accent mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                    <Clock className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    No upcoming courses at the moment
                  </h3>
                  <p className="text-muted-foreground">
                    We&apos;re working on new courses. Check back soon or
                    explore our current offerings.
                  </p>
                </div>
              </ScrollReveal>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
