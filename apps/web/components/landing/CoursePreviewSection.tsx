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
    <section className="section-padding">
      <div className="container">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              What&apos;s coming up
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Upcoming programs you can join
            </p>
          </div>
        </ScrollReveal>

        {upcomingCourses && upcomingCourses.length > 0 ? (
          <ScrollReveal>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              {upcomingCourses.map((course) => (
                <UpcomingCourseCard key={course._id} course={course} />
              ))}
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal>
            <div className="py-12 text-center">
              <div className="bg-accent mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <Clock className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                No upcoming courses at the moment
              </h3>
              <p className="text-muted-foreground">
                We&apos;re working on new courses. Check back soon or explore
                our current offerings!
              </p>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal>
          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link href="/courses">
                Browse all courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
