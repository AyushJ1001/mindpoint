import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Shield } from "lucide-react";
import { ctaVariants } from "@/components/coastal/cta";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { EmailCapture } from "@/components/coastal/EmailCapture";
import { EightWeekJourney } from "@/components/course-page/eight-week-journey";
import CoastalVideoTestimonials from "@/components/landing/CoastalVideoTestimonials";
import { HomeJanuaryCourses } from "@/components/landing/HomeJanuaryCourses";
import { HomeInstitutions } from "@/components/landing/HomeInstitutions";
import { HomeReviews } from "@/components/landing/HomeReviews";
import type { HomeCourses } from "@/components/landing/home-courses";
import { HOME_FAQ } from "@/lib/home-faq";

interface CoastalHomeProps {
  canAccessAdmin: boolean;
  courses: HomeCourses;
}

const FACULTY_LINE =
  "Taught by faculty with a Master's in psychology and a specialisation diploma or certificate in the subject they teach.";

const AUDIENCE = [
  {
    title: "Psychology students",
    copy: "Studying for a BA, BSc or MA and wanting to see how the theory is used, beyond the syllabus.",
  },
  {
    title: "Graduates",
    copy: "Finished a psychology degree and choosing a direction, or filling gaps before further study.",
  },
  {
    title: "Aspiring counsellors",
    copy: "Preparing for a counselling path and wanting structured grounding in established approaches.",
  },
  {
    title: "Practising professionals",
    copy: "Already working with people and wanting a focused, live course in one area.",
  },
];

const TEACHING = [
  {
    title: "Case-based discussion",
    copy: "Concepts are worked through fictional cases in class, so you see how an idea applies to a person.",
  },
  {
    title: "Detailed study notes",
    copy: "Notes accompany the classes, so you can revise the models and vocabulary at your own pace.",
  },
  {
    title: "Guided practical exercises",
    copy: "In weeks seven and eight you apply what you learned to fictional cases, with faculty feedback.",
  },
  {
    title: "Live online classes",
    copy: "Classes run live on Tuesdays and Thursdays in the evening, IST, so you can join from anywhere in India.",
  },
  {
    title: "Affordable fees",
    copy: "One fee covers the full eight weeks, paid once at checkout.",
  },
  {
    title: "A certificate you can verify",
    copy: "Certificates state completion of a training course. They are not a degree or licence, and each has a public verification code.",
  },
];

const ENROL_STEPS = [
  {
    title: "Choose a course",
    copy: "Compare the January courses, their start dates and class times.",
  },
  {
    title: "Pay securely online",
    copy: "Register and pay the course fee through the secure checkout.",
  },
  {
    title: "Join the live classes",
    copy: "Attend live online on your course's days and times, from wherever you are in India.",
  },
];

export default function CoastalHome({
  canAccessAdmin,
  courses,
}: CoastalHomeProps) {
  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-14 sm:pt-20">
        <div className="container">
          <span className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
            The Mind Point · Psychology education
          </span>
          <h1 className="font-display text-foreground mt-5 max-w-4xl text-4xl leading-[1.06] tracking-[-0.03em] sm:text-6xl">
            Study psychology. Understand it deeply. Learn to apply it.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg sm:text-xl">
            Go beyond textbook definitions with structured psychology courses
            that combine clear teaching, meaningful examples and guided
            practical training.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/january-2027"
              className={ctaVariants({ layout: "flex" })}
            >
              Explore January 2027 Courses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-we-teach"
              className="border-primary/30 text-primary hover:bg-primary/5 inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-xs font-medium tracking-[0.16em] uppercase transition-colors"
            >
              How We Teach
            </Link>
          </div>
          <div className="border-border text-muted-foreground mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dashed pt-6 text-sm">
            <p>
              <b className="text-foreground font-semibold">
                Registration is open
              </b>{" "}
              for courses starting {courses.startSummary ?? "in January 2027"}.
            </p>
            <span
              aria-hidden="true"
              className="bg-border hidden h-4 w-px sm:block"
            />
            <p>
              Free masterclass in preparation.{" "}
              <Link
                href="/masterclass"
                className="text-primary font-semibold underline-offset-4 hover:underline"
              >
                Get notified
              </Link>
            </p>
          </div>
          {canAccessAdmin && (
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm"
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>

        <div className="relative mt-12 h-[220px] w-full overflow-hidden sm:mt-14 sm:h-[380px]">
          <Image
            src="/coastal/hero.jpg"
            alt="Turquoise water meeting pale sand, seen from above."
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#eaf3f4] to-transparent" />
        </div>
      </section>

      {/* ── January 2027 courses ── */}
      <HomeJanuaryCourses courses={courses} />

      {/* ── What The Mind Point is, and who it's for ── */}
      <section
        aria-labelledby="about-heading"
        className="bg-secondary py-20 sm:py-24"
      >
        <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className={eyebrowVariants()}>About The Mind Point</span>
            <h2
              id="about-heading"
              className="font-display mt-4 text-3xl leading-tight tracking-tight sm:text-5xl"
            >
              Psychology education, taught live and in depth.
            </h2>
            <p className="text-muted-foreground mt-6 text-lg leading-8">
              The Mind Point is an Indian psychology-education company. We run
              live online certificate courses, a counselling psychology
              internship and self-paced introductory courses.
            </p>
            <p className="text-foreground border-primary mt-6 border-l-2 pl-4 font-medium">
              {FACULTY_LINE}
            </p>
          </div>
          <div>
            <h3 className="font-display text-2xl">Who the courses are for</h3>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {AUDIENCE.map((item) => (
                <li
                  key={item.title}
                  className="border-border border-t border-dashed pt-4"
                >
                  <b className="font-display block text-xl font-medium">
                    {item.title}
                  </b>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {item.copy}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── How we teach ── */}
      <section
        id="how-we-teach"
        aria-labelledby="how-heading"
        className="scroll-mt-24 py-20 sm:py-28"
      >
        <div className="container">
          <div className="max-w-3xl">
            <span className={eyebrowVariants()}>How we teach</span>
            <h2
              id="how-heading"
              className="font-display mt-4 text-3xl tracking-tight sm:text-5xl"
            >
              Six weeks of live learning, then two weeks of practice.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Every January course follows the same eight-week shape. The first
              six weeks build the concepts and models step by step; the last two
              put them to work on guided exercises.
            </p>
          </div>
          <EightWeekJourney className="mt-10 max-w-4xl" />
          <ul className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {TEACHING.map((item) => (
              <li key={item.title} className="flex gap-3">
                <Check className="text-primary mt-1.5 h-4 w-4 shrink-0" />
                <div>
                  <b className="font-display block text-lg font-medium">
                    {item.title}
                  </b>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {item.copy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── What students learn ── */}
      <section
        aria-labelledby="learn-heading"
        className="border-border border-t border-dashed py-20 sm:py-24"
      >
        <div className="container">
          <div className="mb-12 max-w-3xl">
            <span className={eyebrowVariants()}>What you will learn</span>
            <h2
              id="learn-heading"
              className="font-display mt-4 text-3xl tracking-tight sm:text-5xl"
            >
              A closer look at each course.
            </h2>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {courses.january.map((course) => (
              <div key={course.code} className="border-primary border-t-2 pt-5">
                <h3 className="font-display text-xl">{course.name}</h3>
                <ul className="mt-4 space-y-3">
                  {course.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="text-muted-foreground flex gap-3 text-sm leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="bg-amber mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={course.href}
                  className="text-primary mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                >
                  Full syllabus <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to enroll ── */}
      <section
        aria-labelledby="enrol-heading"
        className="bg-secondary py-20 sm:py-24"
      >
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className={eyebrowVariants()}>How to enroll</span>
            <h2
              id="enrol-heading"
              className="font-display mt-4 text-3xl tracking-tight sm:text-5xl"
            >
              Three steps to your first class.
            </h2>
            <Link
              href="/january-2027"
              className={`${ctaVariants({ layout: "flex" })} mt-8`}
            >
              Explore January 2027 Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ol className="border-border border-t border-dashed">
            {ENROL_STEPS.map((step) => (
              <li
                key={step.title}
                className="border-border grid gap-1 border-b border-dashed py-6 sm:grid-cols-[14rem_1fr] sm:gap-6"
              >
                <b className="font-display text-xl font-medium">{step.title}</b>
                <p className="text-muted-foreground leading-relaxed">
                  {step.copy}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Social proof ── */}
      <HomeReviews />
      <CoastalVideoTestimonials />
      <HomeInstitutions />

      {/* ── First step band ── */}
      <section className="text-primary-foreground relative overflow-hidden">
        <Image
          src="/coastal/wave.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,40,38,0.92),rgba(29,78,74,0.74)_55%,rgba(44,106,99,0.6))]"
          aria-hidden="true"
        />
        <div className="relative z-10 container grid items-center gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className={eyebrowVariants({ tone: "sea" })}>
              A smaller first step
            </span>
            <h2 className="font-display mt-4 max-w-xl text-3xl tracking-tight sm:text-5xl">
              Not sure? Start with one calm conversation.
            </h2>
            <p className="text-primary-foreground/80 mt-4 max-w-lg">
              No pressure to commit to the whole path. Just a supportive first
              moment with someone who listens.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["~20 minutes", "Licensed professional", "Flexible timing"].map(
                (t) => (
                  <span
                    key={t}
                    className="border-primary-foreground/30 bg-primary-foreground/10 rounded-full border px-4 py-1.5 text-sm"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="lg:text-right">
            <div className={eyebrowVariants({ size: "micro", tone: "light" })}>
              From
            </div>
            <div className="font-display text-5xl leading-none">₹600</div>
            <Link
              href="/contact"
              className="bg-background text-primary mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase"
            >
              Book your first session <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Masterclass notify ── */}
      <section className="py-20 sm:py-24">
        <div className="container flex max-w-2xl flex-col items-center gap-5 text-center">
          <span className={eyebrowVariants()}>Free masterclass</span>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            Hear about the free masterclass first.
          </h2>
          <p className="text-muted-foreground max-w-lg">
            We are recording a free session that shows how we teach. Leave your
            email and we will send it when it is released.
          </p>
          <EmailCapture source="masterclass" />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-secondary py-20 sm:py-24">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className={eyebrowVariants()}>Questions</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              A few honest answers.
            </h2>
          </div>
          <div className="border-border border-t border-dashed">
            {HOME_FAQ.map((item) => (
              <details key={item.q} className="faq-item py-5">
                <summary className="font-display text-xl leading-snug">
                  {item.q}
                </summary>
                <p className="text-muted-foreground mt-3 max-w-prose">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="py-24">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h2 className="font-display max-w-3xl text-3xl leading-tight tracking-tight sm:text-5xl">
            Registration is open for January 2027.
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Three live certificate courses, eight weeks each, starting{" "}
            {courses.startSummary ?? "in January 2027"}.
          </p>
          <Link
            href="/january-2027"
            className={ctaVariants({ layout: "flex" })}
          >
            Explore January 2027 Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
