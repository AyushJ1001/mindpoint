import Link from "next/link";
import Image from "next/image";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";
import type { PublicCourse } from "@/lib/backend";
import { PageHero } from "@/components/coastal/PageHero";
import { EmailCapture } from "@/components/coastal/EmailCapture";
import { ctaVariants } from "@/components/coastal/cta";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { EightWeekJourney } from "@/components/course-page/eight-week-journey";
import { formatTime } from "@/lib/course-content/operational";
import { Check } from "lucide-react";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { JANUARY_CERTIFICATE_FEE, availabilityLabel } from "@/lib/pricing";

export const revalidate = 1800;

export const metadata = {
  title: "January 2027 certificate cohorts - The Mind Point",
  description:
    "Live certificate cohorts start in January 2027: CBT, REBT and CBMT; Inner Child Healing & Therapy; and Personality Disorders. Eight weeks each: six weeks of learning, then two weeks of practical training.",
  alternates: { canonical: "/january-2027" },
};

const FULL_PRICE = JANUARY_CERTIFICATE_FEE;

const COHORTS = [
  {
    code: "CCCBT",
    match: "CBMT",
    name: "CBT, REBT, CBMT",
    blurb:
      "The three core cognitive and behavioural approaches in one certificate, and how to reason with them through fictional cases.",
    image: "/coastal/shore.jpg",
    duration: "8 weeks",
  },
  {
    code: "CCICH",
    match: "Inner Child Healing",
    name: "Inner Child Healing",
    blurb:
      "How childhood experiences shape adult life, and trauma-informed ways to nurture and reconnect with the inner child.",
    image: "/coastal/calm.jpg",
    duration: "8 weeks",
  },
  {
    code: "CCPD",
    match: "Personality Disorders",
    name: "Personality Disorders",
    blurb:
      "How personality disorders are classified, assessed and understood — and how to work with them ethically, without stigma.",
    image: "/coastal/hero.jpg",
    duration: "8 weeks",
  },
];

const INCLUDED = [
  "Six weeks of learning, then two weeks of practical training",
  "Live online classes on Tuesdays and Thursdays",
  "Small live cohort, so discussion stays real",
  "Practice and feedback, not just theory",
  "Certificate with public verification",
  "Study notes and reading for every week",
  "Support within 48–72 hours on working days",
];

async function getCourses(): Promise<PublicCourse[]> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return [];
  try {
    const convex = new ConvexHttpClient(convexUrl);
    const courses = await convex.query(api.courses.listCourses, {});
    return courses ?? [];
  } catch (error) {
    console.warn("Failed to fetch courses for the January page:", error);
    return [];
  }
}

function formatSchedule(batch?: PublicCourse["nextAvailableBatch"]) {
  if (!batch) return undefined;
  const days = batch.daysOfWeek.map((day) => day.slice(0, 3)).join(" & ");
  const start = formatTime(batch.startTime);
  const end = formatTime(batch.endTime);
  const time = start && end ? `${start}–${end} IST` : undefined;
  return [days, time].filter(Boolean).join(" · ") || undefined;
}

function formatStart(value?: string) {
  if (!value) return "Starts January 2027";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Starts January 2027";
  return `Starts ${new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)}`;
}

export default async function JanuaryLandingPage() {
  const courses = await getCourses();

  const cohorts = COHORTS.map((cohort) => {
    const course =
      courses.find((c) => c.code === cohort.code) ??
      courses.find((c) =>
        c.name.toLowerCase().includes(cohort.match.toLowerCase()),
      );
    return {
      ...cohort,
      href: course ? `/courses/${course._id}` : "/courses/certificate",
      price: course?.price ?? FULL_PRICE,
      startDate: course?.nextAvailableBatch?.startDate,
      schedule: formatSchedule(course?.nextAvailableBatch),
      seatsLeft: course?.nextAvailableBatch
        ? Math.max(
            0,
            course.nextAvailableBatch.capacity -
              course.nextAvailableBatch.enrolledCount,
          )
        : undefined,
      capacity: course?.nextAvailableBatch?.capacity,
    };
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Mind Point — January 2027 certificate cohorts",
    itemListElement: cohorts.map((cohort, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: cohort.name,
        description: cohort.blurb,
        inLanguage: "en",
        courseMode: "online",
        url: `https://www.themindpoint.org${cohort.href}`,
        provider: {
          "@type": "Organization",
          name: "The Mind Point",
          url: "https://www.themindpoint.org",
        },
        offers: {
          "@type": "Offer",
          price: cohort.price,
          priceCurrency: "INR",
          // Only claim availability the cohort schedule backs up.
          ...(cohort.seatsLeft === undefined
            ? {}
            : {
                availability:
                  cohort.seatsLeft > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/SoldOut",
              }),
          url: "https://www.themindpoint.org/january-2027",
        },
      },
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="January 2027"
        title={
          <>
            Live cohorts, <em className="italic">one clear start.</em>
          </>
        }
        lead="Small, live certificate cohorts for psychology students, graduates and practising counsellors, starting in January 2027."
        image="/coastal/hero.jpg"
        imageAlt="Turquoise water meeting pale sand, seen from above."
        caption="A coastline, seen from above."
      />

      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className={eyebrowVariants()}>The certificate cohorts</span>
              <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
                Choose your certificate.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Each course runs for eight weeks, live on Tuesdays and Thursdays.
              Dates and times below come straight from the cohort schedule.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {cohorts.map((cohort) => (
              <article
                key={cohort.code}
                className="group border-border bg-card flex flex-col overflow-hidden rounded border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_70px_-46px_rgba(19,46,43,0.6)]"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={cohort.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="bg-background/90 text-primary absolute top-4 left-4 rounded-full px-3 py-1 text-[0.6rem] font-semibold tracking-[0.2em] uppercase">
                    {cohort.duration}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <h3 className="font-display text-2xl leading-snug">
                    {cohort.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {cohort.blurb}
                  </p>
                  <div className="text-sm">
                    <p className="text-foreground font-medium">
                      {formatStart(cohort.startDate)}
                    </p>
                    {cohort.schedule ? (
                      <p className="text-muted-foreground">{cohort.schedule}</p>
                    ) : null}
                  </div>
                  <EightWeekJourney compact className="mt-1" />
                  <div className="border-border mt-auto flex items-end justify-between border-t border-dashed pt-4">
                    <div>
                      <div className="font-display text-xl">
                        ₹{cohort.price.toLocaleString("en-IN")}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {availabilityLabel(cohort.seatsLeft, cohort.capacity)}
                      </div>
                    </div>
                    <TrackedLink
                      href={cohort.href}
                      event="course_card_click"
                      eventParams={{
                        course_code: cohort.code,
                        source: "january_2027",
                      }}
                      className="text-primary text-[0.7rem] font-semibold tracking-[0.18em] uppercase"
                    >
                      Enroll →
                    </TrackedLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="container max-w-4xl">
          <span className={eyebrowVariants()}>How the eight weeks work</span>
          <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
            Six weeks of learning. Two weeks of practice.
          </h2>
          <EightWeekJourney className="mt-8" />
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <b className="font-display block text-lg font-medium">
                Weeks 1–6: structured learning
              </b>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Live classes build the concepts, models and vocabulary step by
                step, with reading notes and fictional examples alongside each
                class.
              </p>
            </div>
            <div>
              <b className="font-display block text-lg font-medium">
                Weeks 7–8: practical training
              </b>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Guided exercises on fictional cases, with faculty feedback on
                your reasoning. You practise applying what the first six weeks
                taught.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-16 sm:py-20">
        <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className={eyebrowVariants()}>
              What every cohort includes
            </span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              Taught properly, and priced for real life.
            </h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="text-primary mt-1 h-4 w-4 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container grid gap-10 lg:grid-cols-3">
          <div className="border-border border-primary border-t-2 pt-5">
            <b className="font-display block text-xl font-medium">
              Registration
            </b>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Each certificate course is ₹{FULL_PRICE.toLocaleString("en-IN")}{" "}
              for the full eight weeks, paid securely online at checkout.
            </p>
          </div>
          <div className="border-border border-primary border-t-2 pt-5">
            <b className="font-display block text-xl font-medium">Schedule</b>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Live online on Tuesdays and Thursdays, starting in January 2027.
              Each course card above shows its exact start date and time in IST.
            </p>
          </div>
          <div className="border-border border-primary border-t-2 pt-5">
            <b className="font-display block text-xl font-medium">
              Honest certificate
            </b>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Every certificate states completion honestly — not a degree, not a
              licence — and carries a public verification code.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-24">
        <div className="container flex max-w-2xl flex-col items-center gap-5 text-center">
          <span className={eyebrowVariants()}>Not ready to choose?</span>
          <h2 className="font-display text-3xl tracking-tight sm:text-5xl">
            Hear about the free masterclass first.
          </h2>
          <p className="text-muted-foreground max-w-lg">
            We are recording a free session that shows how we teach. Leave your
            email and we will send it when it is released.
          </p>
          <EmailCapture source="january-2027" />
        </div>
      </section>

      <section className="py-16">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h2 className="font-display max-w-2xl text-3xl leading-tight tracking-tight sm:text-4xl">
            Registration is open for January 2027.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/courses/certificate" className={ctaVariants()}>
              See all certificates
            </Link>
            <Link
              href="/join"
              className="text-primary text-sm font-semibold underline-offset-4 hover:underline"
            >
              Ask us a question →
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
