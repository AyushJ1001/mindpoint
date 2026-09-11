import { Clock, ArrowRight } from "lucide-react";
import { UpcomingCourseCard } from "@/components/course-card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LeafAccent } from "@/components/illustrations";
import type { PublicCourse } from "@/lib/backend";

interface CoursePreviewSectionProps {
  upcomingCourses: PublicCourse[];
}

export default function CoursePreviewSection({
  upcomingCourses,
}: CoursePreviewSectionProps) {
  return (
    <section className="brand-section-tint home-section-md relative border-y border-primary/5">
      <div className="container">
        <ScrollReveal>
          <div className="mx-auto max-w-6xl">
            <div className="relative mb-11 flex flex-col gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
              <div className="max-w-2xl">
                <div className="flex items-center justify-center gap-4 lg:justify-start">
                  <span className="brand-gold-rule" aria-hidden="true" />
                  <span className="brand-kicker">Now enrolling</span>
                </div>
                <h2 className="font-display text-foreground mt-4 text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
                  Find your next place to learn
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-8">
                  Live cohorts and practical psychology programs with clear
                  dates, thoughtful guidance, and learning you can carry into
                  real life and work.
                </p>
              </div>
              <Button
                variant="outline"
                asChild
                className="self-center rounded-full border-primary/20 bg-background/70 px-6 lg:self-auto"
              >
                <Link href="/courses">
                  View all programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <LeafAccent className="pointer-events-none absolute -bottom-5 left-[10%] hidden h-9 w-9 -rotate-[20deg] opacity-30 lg:block" />
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
                <div className="brand-panel mx-auto max-w-2xl rounded-[2rem] px-6 py-12 text-center">
                  <div className="bg-primary/8 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                    <Clock className="text-primary h-7 w-7" />
                  </div>
                  <h3 className="font-display text-2xl font-medium">
                    New cohorts are being prepared
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Explore our current offerings while the next live programs
                    are being scheduled.
                  </p>
                </div>
              </ScrollReveal>
            )}
          </div>
        </ScrollReveal>
      </div>

      <LeafAccent className="pointer-events-none absolute right-[4%] bottom-0 hidden h-10 w-10 rotate-[35deg] opacity-20 select-none lg:block" />
    </section>
  );
}
