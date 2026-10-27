import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { EightWeekJourney } from "@/components/course-page/eight-week-journey";
import { availabilityLabel } from "@/lib/pricing";
import type {
  HomeCourse,
  HomeCourses,
} from "@/components/landing/home-courses";

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function CourseColumn({ course }: { course: HomeCourse }) {
  const { live } = course;
  return (
    <article className="border-border flex flex-col gap-4 border-t border-dashed p-6 first:border-t-0 sm:p-8 md:border-t-0 md:border-l md:first:border-l-0">
      <h3 className="font-display text-2xl leading-snug">{course.name}</h3>

      {live?.startDate ? (
        <dl className="grid gap-1 text-sm">
          <div>
            <dt className="sr-only">Starts</dt>
            <dd className="text-foreground font-medium">
              Starts {live.startDate}
            </dd>
          </div>
          {live.days || live.time ? (
            <div>
              <dt className="sr-only">Schedule</dt>
              <dd className="text-muted-foreground">
                {[live.days, live.time].filter(Boolean).join(" · ")}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="text-muted-foreground text-sm">
          Live online, starting January 2027.
        </p>
      )}

      <EightWeekJourney compact />

      <div className="mt-auto flex items-end justify-between gap-4 pt-2">
        {live?.price ? (
          <div>
            <div className="font-display text-2xl">
              {formatPrice(live.price)}
            </div>
            {live.seatsLeft !== undefined ? (
              <div className="text-muted-foreground text-xs">
                {availabilityLabel(live.seatsLeft, live.capacity)}
              </div>
            ) : null}
          </div>
        ) : (
          <span />
        )}
        <Link
          href={course.href}
          className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          aria-label={`View ${course.name}`}
        >
          View course <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function HomeJanuaryCourses({ courses }: { courses: HomeCourses }) {
  const { internship } = courses;
  return (
    <section
      id="january-2027"
      aria-labelledby="january-heading"
      className="scroll-mt-24 py-20 sm:py-24"
    >
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className={eyebrowVariants()}>Registration open</span>
            <h2
              id="january-heading"
              className="font-display mt-4 text-3xl tracking-tight sm:text-5xl"
            >
              January 2027 certificate courses
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Three live online courses, each eight weeks long: six weeks of
              structured learning, then two weeks of practical training. Classes
              run on Tuesdays and Thursdays.
            </p>
          </div>
          <Link
            href="/january-2027"
            className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          >
            All January details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="border-border bg-card grid overflow-hidden rounded-3xl border shadow-[0_20px_55px_rgba(0,62,65,0.08)] md:grid-cols-3">
          {courses.january.map((course) => (
            <CourseColumn key={course.code} course={course} />
          ))}
        </div>

        <div className="text-muted-foreground mt-8 grid gap-3 text-sm sm:grid-cols-2">
          <p>
            Also open:{" "}
            <Link
              href={internship.href}
              className="text-primary font-semibold underline-offset-4 hover:underline"
            >
              {internship.name}
            </Link>
            {internship.live?.startDate
              ? `, starting ${internship.live.startDate}`
              : ""}
            {internship.live?.days ? `, ${internship.live.days}` : ""}
            {internship.live?.price
              ? `, ${formatPrice(internship.live.price)}`
              : ""}
            .
          </p>
          <p className="sm:text-right">
            Prefer to begin on your own?{" "}
            <Link
              href="/courses/intro"
              className="text-primary font-semibold underline-offset-4 hover:underline"
            >
              Self-paced introductions
            </Link>{" "}
            are ₹999 each, credited in full if you upgrade to any certificate
            course.
          </p>
        </div>
      </div>
    </section>
  );
}
