import Link from "next/link";

import { FacultyProfiles } from "@/components/course/FacultyProfiles";
import { TrackProgrammeView } from "@/components/analytics/TrackProgrammeView";
import { Reveal } from "@/components/motion/Reveal";
import { getCoursePrice, getOfferDetails } from "@/lib/domain/pricing";
import type { CourseContent } from "@/lib/course-content/types";
import type { PublicCourse } from "@/lib/backend";

function formatDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value?: string) {
  if (!value) return undefined;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "pm" : "am";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${match[2]} ${suffix}`;
}

const Section = ({
  id,
  eyebrow,
  title,
  children,
  tone = "ivory",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  tone?: "ivory" | "mist" | "plain";
}) => (
  <section
    id={id}
    className={
      tone === "mist"
        ? "bg-section-mist py-16 sm:py-24"
        : tone === "plain"
          ? "py-16 sm:py-24"
          : "bg-section-ivory py-16 sm:py-24"
    }
  >
    <div className="container max-w-5xl">
      {eyebrow ? (
        <span className="text-brand-sage text-[0.68rem] font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-brand-heading mt-3 text-3xl leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      <Reveal className="mt-8">{children}</Reveal>
    </div>
  </section>
);

/**
 * Refined certificate-course page, first applied to CBT, REBT and CBMT.
 *
 * Operational facts (price, date, schedule, seats) come from the catalogue row
 * passed in, so an active campaign shows its discounted price and the checkout
 * link is the same one the rest of the site uses. Nothing here writes data.
 */
export function PremiumCoursePage({
  course,
  catalogue,
  courseCode,
}: {
  course: CourseContent;
  catalogue?: PublicCourse;
  courseCode: string;
}) {
  const standardPrice = catalogue?.price ?? 4500;
  const offer = catalogue ? getOfferDetails(catalogue) : null;
  const payable = catalogue ? getCoursePrice(catalogue) : standardPrice;
  const batch = catalogue?.nextAvailableBatch;
  const startDate = formatDate(batch?.startDate ?? course.liveStart);
  const time = [formatTime(batch?.startTime), formatTime(batch?.endTime)]
    .filter(Boolean)
    .join("–");
  // Carry the cohort in the enrolment link. Until cohort selection is fixed on
  // the page itself, this is what makes Add to cart available on arrival.
  const batchParam = batch?._id ? `&batch=${batch._id}` : "";
  const checkoutHref = catalogue
    ? `/courses/${catalogue._id}?checkout=1${batchParam}`
    : "/programs";

  // A draft course has no catalogue row and no purchasable cohort, so the page
  // says so rather than offering a button that leads nowhere.
  const registrationsOpen = Boolean(
    catalogue && batch && batch.availabilityStatus === "upcoming_open",
  );
  const monthLabel = startDate
    ? startDate.split(" ").slice(1).join(" ")
    : "the next cohort";

  return (
    <>
      <TrackProgrammeView courseCode={courseCode} />

      {/* Hero */}
      <section className="bg-section-deep relative isolate overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(120%_100%_at_85%_0%,#2b6f66_0%,#1a4a45_45%,#12322e_100%)]"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 800 500"
          className="absolute -right-24 -bottom-24 -z-10 h-[420px] w-[680px] opacity-[0.22]"
        >
          {[0, 1, 2, 3, 4, 5].map((ring) => (
            <circle
              key={ring}
              cx="520"
              cy="300"
              r={60 + ring * 52}
              fill="none"
              stroke="#D7B88A"
              strokeWidth="0.8"
            />
          ))}
        </svg>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(23,63,58,0.93)_0%,rgba(23,63,58,0.85)_55%,rgba(29,78,74,0.55)_100%)]"
        />
        <div className="container max-w-5xl py-16 sm:py-24">
          <span className="text-brand-gold text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
            {course.hero?.eyebrow ?? "Live certificate"}
          </span>
          <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.1] tracking-[-0.02em] sm:text-5xl">
            {course.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
            {course.tagline}
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/25 pt-6 text-sm text-white/90">
            <div>
              <dt className="text-white/60 text-xs tracking-[0.12em] uppercase">
                Starts
              </dt>
              <dd className="mt-1 font-medium text-white">
                {startDate ?? "January 2027"}
                {batch?.daysOfWeek?.length
                  ? ` · ${batch.daysOfWeek.map((day) => day.slice(0, 3)).join(" & ")}`
                  : ""}
              </dd>
            </div>
            <div>
              <dt className="text-white/60 text-xs tracking-[0.12em] uppercase">
                Time
              </dt>
              <dd className="mt-1 font-medium text-white">
                {time ? `${time} IST` : "Tue & Thu evenings"}
              </dd>
            </div>
            <div>
              <dt className="text-white/60 text-xs tracking-[0.12em] uppercase">
                Duration
              </dt>
              <dd className="mt-1 font-medium text-white">Eight weeks</dd>
            </div>
            <div>
              <dt className="text-white/60 text-xs tracking-[0.12em] uppercase">
                Fee
              </dt>
              <dd className="mt-1 font-medium text-white">
                {offer?.hasDiscount ? (
                  <>
                    <span className="mr-2 text-white/60 line-through">
                      ₹{standardPrice.toLocaleString("en-IN")}
                    </span>
                    ₹{payable.toLocaleString("en-IN")}
                  </>
                ) : (
                  `₹${standardPrice.toLocaleString("en-IN")}`
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {registrationsOpen ? (
              <Link
                href={checkoutHref}
                className="bg-brand-ivory text-brand-teal rounded-brand inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold"
              >
                Enrol for {monthLabel}
              </Link>
            ) : (
              <Link
                href="/contact"
                className="bg-brand-ivory text-brand-teal rounded-brand inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold"
              >
                {course.cta.primaryLabel}
              </Link>
            )}
            <span className="text-sm text-white/80">
              {registrationsOpen ? "Registrations open" : "Registrations open soon"}
            </span>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <Section
        eyebrow="What you will be able to do"
        title="Understanding you can put to work."
        tone="ivory"
      >
        <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {course.learningOutcomes.map((outcome) => (
            <li key={outcome} className="border-brand-gold/20 border-t pt-3 text-brand-body">
              {outcome}
            </li>
          ))}
        </ul>
      </Section>

      {/* Journey */}
      <Section
        eyebrow="The eight weeks"
        title="Six Weeks to Build Your Understanding. Two Weeks to Bring It to Life."
        tone="mist"
      >
        <p className="text-brand-body max-w-2xl leading-8">
          The first six weeks build the vocabulary, models and reasoning behind
          the subject. The final two weeks are practical: faculty-curated
          exercises, case discussion and feedback, so the ideas stop being
          abstract.
        </p>
        <div className="relative mt-10">
          <span
            aria-hidden="true"
            className="via-brand-gold/50 absolute top-[3px] right-0 left-0 hidden h-px bg-gradient-to-r from-transparent to-transparent lg:block"
          />
          <span
            aria-hidden="true"
            className="via-brand-gold/45 absolute top-1 bottom-1 left-[3px] w-px bg-gradient-to-b from-transparent to-transparent lg:hidden"
          />
          <ol className="relative grid grid-cols-1 gap-4 pl-5 lg:grid-cols-8 lg:pl-0">
          {["1", "2", "3", "4", "5", "6", "7", "8"].map((week, index) => (
            <li key={week} className="relative pt-0 lg:pt-6">
              <span
                aria-hidden="true"
                className={`absolute top-1 -left-5 h-2 w-2 rounded-full lg:top-0 lg:left-0 ${
                  index < 6 ? "bg-brand-teal" : "bg-brand-gold"
                }`}
              />
              <span className="text-brand-sage text-[0.66rem] font-semibold tracking-[0.14em] uppercase">
                Week {week}
              </span>
              <p className="font-display text-brand-heading mt-1 text-sm leading-snug sm:text-base">
                {index < 6 ? "Structured learning" : "Practical application"}
              </p>
            </li>
          ))}
          </ol>
        </div>
      </Section>

      {/* Curriculum accordions */}
      <Section eyebrow="Curriculum" title="What you will cover, week by week">
        <div className="space-y-3">
          {(course.curriculum?.stages ?? []).map((stage) => (
            <details
              key={stage.key}
              className="border-brand-gold/25 rounded-brand border bg-white/70 px-5 py-4"
            >
              <summary className="font-display text-brand-heading cursor-pointer text-lg">
                {stage.label}
                <span className="text-brand-body mt-1 block text-sm font-normal">
                  {stage.blurb}
                </span>
              </summary>
              <ul className="mt-4 space-y-3">
                {stage.items.map((item) => (
                  <li key={item.title} className="border-brand-gold/15 border-t pt-3">
                    <b className="text-brand-heading font-medium">{item.title}</b>
                    <p className="text-brand-body mt-1 text-sm leading-relaxed">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </Section>

      {/* Practical */}
      <Section
        eyebrow="Practical learning"
        title="A Glimpse Into Your Practical Learning Experience"
        tone="mist"
      >
        <p className="text-brand-body max-w-2xl leading-8">
          Move beyond theoretical understanding through practical learning
          experiences thoughtfully curated by your faculty. Depending on the
          subject and learning objectives, these may include case discussions,
          guided exercises, demonstrations, reflective activities and applied
          learning tasks.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            "Case discussions",
            "Guided exercises",
            "Demonstrations",
            "Reflective activities",
            "Applied learning tasks",
            "Faculty feedback",
          ].map((item) => (
            <li
              key={item}
              className="border-brand-gold/20 rounded-brand border bg-white/60 px-4 py-3 text-sm"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="text-brand-body/70 mt-4 text-xs">
          Practical activities are curated by faculty and may vary across
          courses and batches.
        </p>
      </Section>

      {/* Recordings */}
      <Section eyebrow="Lifetime access" title="Learn Live. Revisit Anytime.">
        <p className="text-brand-body max-w-2xl leading-8">
          Attend interactive live sessions and return to your course recordings
          whenever you want to revisit an important concept, refresh your
          understanding or continue learning at your own pace.
        </p>
        <p className="text-brand-body/70 mt-3 text-sm">
          Enrolments from 27 October 2026 keep recordings for as long as the
          platform operates, with 90 days&rsquo; notice and a download window if
          it ever closes.
        </p>
      </Section>

      {/* Materials and certificate */}
      <Section eyebrow="Materials and certificate" title="What you take away" tone="mist">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <b className="font-display text-brand-heading text-lg">
              Study materials
            </b>
            <ul className="text-brand-body mt-3 space-y-2 text-sm">
              {(course.materials?.items ?? []).slice(0, 5).map((item) => (
                <li key={item.label} className="border-brand-gold/15 border-t pt-2">
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <b className="font-display text-brand-heading text-lg">
              Certificate
            </b>
            <p className="text-brand-body mt-3 text-sm leading-relaxed">
              A certificate of completion, publicly verifiable online. It
              records what you completed and is not a degree, licence or
              statutory registration.
            </p>
          </div>
        </div>
      </Section>

      {/* Faculty */}
      <div className="bg-section-ivory">
        <FacultyProfiles courseId={catalogue?._id} />
      </div>

      {/* FAQs */}
      <Section eyebrow="Questions" title="Answers before you enrol">
        <div className="space-y-3">
          {course.faq.slice(0, 8).map((item) => (
            <details
              key={item.question}
              className="border-brand-gold/20 rounded-brand border bg-white/70 px-5 py-4"
            >
              <summary className="text-brand-heading cursor-pointer font-medium">
                {item.question}
              </summary>
              <p className="text-brand-body mt-2 text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-secondary py-16 sm:py-20">
        <div className="container flex max-w-3xl flex-col items-start gap-4 sm:items-center sm:text-center">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            Join the January 2027 cohort.
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Eight weeks, live online, with two weeks of practical training.
            {startDate ? ` Starts ${startDate}.` : ""}
          </p>
          <Link
            href={checkoutHref}
            className="bg-primary text-primary-foreground rounded-brand mt-2 inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold"
          >
            Enrol now · ₹{payable.toLocaleString("en-IN")}
          </Link>
        </div>
      </section>
    </>
  );
}
