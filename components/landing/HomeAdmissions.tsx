import Link from "next/link";

import type { HomeCourses } from "@/components/landing/home-courses";

/**
 * January–February 2027 admissions: the four certificate courses and the
 * internship, in one section. The three live certificates link to their own
 * pages, which carry the cohort in the enrolment link. PTSD is shown as coming
 * soon because its cohort and faculty are not approved yet — no button that
 * would lead nowhere.
 */
export function HomeAdmissions({ courses }: { courses: HomeCourses }) {
  const certificates = courses.january;
  const internship = courses.internship;

  return (
    <section
      id="admissions"
      aria-labelledby="admissions-heading"
      className="bg-section-mist py-section-sm sm:py-section"
    >
      <div className="container">
        <div className="max-w-2xl">
          <span className="text-brand-sage text-[0.68rem] font-semibold tracking-[0.18em] uppercase">
            January–February 2027 admissions
          </span>
          <h2
            id="admissions-heading"
            className="font-display text-brand-heading mt-3 text-3xl leading-tight tracking-tight sm:text-5xl"
          >
            Your Next Chapter in Psychology Begins Here.
          </h2>
          <p className="text-brand-body mt-4 leading-8">
            Explore structured certificate courses and practical learning
            opportunities designed to deepen your understanding and support
            meaningful academic growth.
          </p>
        </div>



        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {certificates.map((course) => (
            <article
              key={course.code}
              className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6"
            >
              <h3 className="font-display text-brand-heading text-xl leading-snug">
                {course.name}
              </h3>
              <p className="text-brand-body text-sm">
                Starts {course.live?.startDate ?? "January 2027"}
                {course.live?.days ? ` · ${course.live.days}` : ""}
              </p>
              <div className="mt-auto flex items-end justify-between gap-4 pt-2">
                <div>
                  <div className="font-display text-brand-heading text-xl">
                    {course.live?.price
                      ? `₹${course.live.price.toLocaleString("en-IN")}`
                      : "₹4,500"}
                  </div>
                  <div className="text-brand-body text-xs">
                    Eight weeks · live online
                  </div>
                </div>
                <Link
                  href={course.href}
                  className="text-brand-teal text-sm font-semibold underline-offset-4 hover:underline"
                >
                  View course →
                </Link>
              </div>
            </article>
          ))}

          {/* PTSD: cohort and faculty not approved, so no enrolment action. */}
          <article className="border-brand-gold/40 bg-card flex flex-col gap-3 rounded-2xl border border-dashed p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-brand-heading text-xl leading-snug">
                PTSD &amp; Complex Trauma
              </h3>
              <span className="text-brand-teal border-brand-gold/40 rounded border px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.12em] uppercase">
                Registrations open
              </span>
            </div>
            <p className="text-brand-body text-sm">
              Starts 2 February 2027 · 7:30–8:30 pm IST
            </p>
            <div className="mt-auto flex items-end justify-between gap-4 pt-2">
              <div>
                <div className="font-display text-brand-heading text-xl">
                  ₹4,500
                </div>
                <div className="text-brand-body text-xs">
                  Eight weeks · Tue &amp; Thu
                </div>
              </div>
              <Link
                href="/programs/ptsd-complex-trauma"
                className="text-brand-teal text-sm font-semibold underline-offset-4 hover:underline"
              >
                View course →
              </Link>
            </div>
          </article>
        </div>

        {internship ? (
          <article className="border-brand-gold/30 bg-section-ivory mt-6 grid gap-4 rounded-2xl border p-6 sm:grid-cols-[1.4fr_1fr] sm:items-end">
            <div>
              <span className="text-brand-sage text-[0.66rem] font-semibold tracking-[0.16em] uppercase">
                Also in this intake
              </span>
              <h3 className="font-display text-brand-heading mt-2 text-2xl leading-snug">
                {internship.name}
              </h3>
              <p className="text-brand-body mt-2 max-w-xl text-sm leading-relaxed">
                Supervised practice with fictional and role-played cases, clear
                milestones and faculty feedback. It is a training internship,
                not a licence to practise.
              </p>
            </div>
            <div className="sm:text-right">
              <div className="font-display text-brand-heading text-2xl">
                {internship.live?.price
                  ? `₹${internship.live.price.toLocaleString("en-IN")}`
                  : "₹2,499"}
              </div>
              <p className="text-brand-body text-xs">
                {internship.live?.startDate
                  ? `Starts ${internship.live.startDate}`
                  : "Starts 18 January 2027"}
              </p>
              <Link
                href={internship.href}
                className="text-brand-teal mt-3 inline-block text-sm font-semibold underline underline-offset-4"
              >
                View the internship →
              </Link>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
