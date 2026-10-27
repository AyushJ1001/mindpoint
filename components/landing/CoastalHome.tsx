import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  History,
  Layers,
  Video,
} from "lucide-react";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { EmailCapture } from "@/components/coastal/EmailCapture";
import { EightWeekJourney } from "@/components/course-page/eight-week-journey";
import CoastalVideoTestimonials from "@/components/landing/CoastalVideoTestimonials";
import { HomeHero } from "@/components/landing/HomeHero";
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

const OFFERINGS = [
  {
    icon: CalendarDays,
    title: "Eight-week certificate courses",
    copy: "Each course runs for eight weeks and ends with a certificate of completion.",
  },
  {
    icon: Layers,
    title: "Six weeks of learning, two of practice",
    copy: "Six weeks of structured learning, then two weeks of practical application.",
  },
  {
    icon: Video,
    title: "Live online teaching",
    copy: "Classes run live on Tuesdays and Thursdays in the evening, IST, so you can join from anywhere in India.",
  },
  {
    icon: BookOpen,
    title: "Detailed study notes",
    copy: "Notes accompany the classes, so you can revise the models and vocabulary at your own pace.",
  },
  {
    icon: ClipboardCheck,
    title: "Faculty-curated practicals",
    copy: "The practical weeks are designed by faculty and worked through on fictional cases, with feedback.",
  },
  {
    icon: History,
    title: "Lifetime recording access",
    copy: "Eligible new enrolments keep access to the class recordings.",
  },
];

const TEACHING = [
  {
    title: "Case-based discussion",
    copy: "Concepts are worked through fictional cases in class, so you see how an idea applies to a person.",
  },
  {
    title: "Guided practical exercises",
    copy: "In weeks seven and eight you apply what you learned to fictional cases, with faculty feedback.",
  },
  {
    title: "Live, not pre-recorded",
    copy: "You can ask questions in the moment and hear how other learners reason through the same case.",
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

const brandButton =
  "bg-brand-button text-brand-button-foreground inline-flex items-center justify-center gap-2 rounded-brand px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90";

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function CoastalHome({
  canAccessAdmin,
  courses,
}: CoastalHomeProps) {
  return (
    <>
      <HomeHero
        canAccessAdmin={canAccessAdmin}
        startSummary={courses.startSummary}
      />

      {/* ── What The Mind Point offers ── */}
      <section
        id="what-we-offer"
        aria-labelledby="offer-heading"
        className="bg-section-ivory py-section-sm sm:py-section scroll-mt-24"
      >
        <div className="container">
          <div className="max-w-3xl">
            <h2
              id="offer-heading"
              className="font-display text-brand-heading text-3xl leading-tight tracking-tight sm:text-5xl"
            >
              What The Mind Point offers
            </h2>
            <p className="text-brand-body mt-5 text-lg leading-8">
              The Mind Point is an Indian psychology-education company. We run
              live online certificate courses, a counselling psychology
              internship and self-paced introductory courses.
            </p>
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {OFFERINGS.map(({ icon: Icon, title, copy }) => (
              <li key={title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="bg-section-mist text-brand-sage rounded-brand flex h-11 w-11 shrink-0 items-center justify-center"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-brand-heading text-xl leading-snug font-medium">
                    {title}
                  </h3>
                  <p className="text-brand-body mt-1.5 text-sm leading-relaxed">
                    {copy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="border-brand-gold bg-section-mist text-brand-heading rounded-brand mt-12 max-w-3xl border-l-4 px-5 py-4 text-base leading-7">
            <b className="font-semibold">
              {courses.introPrice
                ? `${formatPrice(courses.introPrice)} introduction credit.`
                : "Introduction credit."}
            </b>{" "}
            Start with a self-paced introduction; its fee is credited once
            against any certificate course if you upgrade.{" "}
            <Link
              href="/courses/intro"
              className="font-semibold underline underline-offset-4"
            >
              See the introductions
            </Link>
          </p>
        </div>
      </section>

      {/* ── January 2027 courses ── */}
      <HomeJanuaryCourses courses={courses} />

      {/* ── Who the courses are for ── */}
      <section
        aria-labelledby="audience-heading"
        className="bg-section-ivory py-section-sm sm:py-section"
      >
        <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2
              id="audience-heading"
              className="font-display text-brand-heading text-3xl leading-tight tracking-tight sm:text-5xl"
            >
              Who the courses are for
            </h2>
            <p className="text-brand-body mt-6 text-lg leading-8">
              Some courses assume no prior training; others are built for
              students and practitioners. Each programme page says who it is
              for.
            </p>
            <p className="text-brand-heading border-brand-gold mt-6 border-l-2 pl-4 font-medium">
              {FACULTY_LINE}
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {AUDIENCE.map((item) => (
              <li
                key={item.title}
                className="bg-card rounded-brand-lg shadow-brand-sm p-6"
              >
                <b className="font-display text-brand-heading block text-xl font-medium">
                  {item.title}
                </b>
                <p className="text-brand-body mt-2 text-sm leading-relaxed">
                  {item.copy}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How we teach ── */}
      <section
        id="approach"
        aria-labelledby="how-heading"
        className="bg-section-mist py-section-sm sm:py-section scroll-mt-24"
      >
        <div className="container">
          <div className="max-w-3xl">
            <h2
              id="how-heading"
              className="font-display text-brand-heading text-3xl tracking-tight sm:text-5xl"
            >
              Why the learning experience is different
            </h2>
            <p className="text-brand-body mt-4 text-lg">
              Every January course follows the same eight-week shape. The first
              six weeks build the concepts and models step by step; the last two
              put them to work on guided exercises.
            </p>
          </div>
          <EightWeekJourney className="mt-10 max-w-4xl" />
          <ul className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {TEACHING.map((item) => (
              <li key={item.title} className="flex gap-3">
                <Check className="text-brand-sage mt-1.5 h-4 w-4 shrink-0" />
                <div>
                  <b className="font-display text-brand-heading block text-lg font-medium">
                    {item.title}
                  </b>
                  <p className="text-brand-body mt-1 text-sm leading-relaxed">
                    {item.copy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Practical value ── */}
      <section
        id="practical-value"
        aria-labelledby="learn-heading"
        className="bg-section-ivory py-section-sm sm:py-section scroll-mt-24"
      >
        <div className="container">
          <div className="mb-12 max-w-3xl">
            <h2
              id="learn-heading"
              className="font-display text-brand-heading text-3xl tracking-tight sm:text-5xl"
            >
              The practical value, course by course
            </h2>
            <p className="text-brand-body mt-4 text-lg">
              What you should be able to do by the end of each course.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {courses.january.map((course) => (
              <div
                key={course.code}
                className="bg-card rounded-brand-lg border-brand-gold shadow-brand-sm border-t-2 p-6"
              >
                <h3 className="font-display text-brand-heading text-xl">
                  {course.name}
                </h3>
                <ul className="mt-4 space-y-3">
                  {course.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="text-brand-body flex gap-3 text-sm leading-relaxed"
                    >
                      <Check
                        aria-hidden="true"
                        className="text-brand-sage mt-0.5 h-4 w-4 shrink-0"
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={course.href}
                  className="text-brand-heading mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                >
                  Full syllabus <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to enrol ── */}
      <section
        id="how-to-enrol"
        aria-labelledby="enrol-heading"
        className="bg-section-mist py-section-sm sm:py-section scroll-mt-24"
      >
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2
              id="enrol-heading"
              className="font-display text-brand-heading text-3xl tracking-tight sm:text-5xl"
            >
              How to enrol
            </h2>
            <p className="text-brand-body mt-4 text-lg">
              Three steps to your first class.
            </p>
            <Link href="/january-2027" className={`${brandButton} mt-8`}>
              Explore January Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ol className="border-brand-sage/30 border-t">
            {ENROL_STEPS.map((step) => (
              <li
                key={step.title}
                className="border-brand-sage/30 grid gap-1 border-b py-6 sm:grid-cols-[14rem_1fr] sm:gap-6"
              >
                <b className="font-display text-brand-heading text-xl font-medium">
                  {step.title}
                </b>
                <p className="text-brand-body leading-relaxed">{step.copy}</p>
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
              className="bg-background text-primary rounded-brand mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
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
      <section className="bg-section-mist py-section-sm sm:py-section">
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
          <Link href="/january-2027" className={brandButton}>
            Explore January Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
