import { PageHero } from "@/components/coastal/PageHero";
import { ProgramTabs } from "@/components/coastal/ProgramTabs";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { Check } from "lucide-react";
import Link from "next/link";
import { getCampaignCourses, januaryCampaign } from "@/lib/course-content";

export const metadata = {
  title: "Programs - The Mind Point",
  description:
    "Live cohorts, self-paced courses, therapy and supervision — each priced and paced for real life.",
  alternates: { canonical: "/programs" },
};

const INCLUDED = [
  "Live weekly classes, recorded for your cohort",
  "Assignments and feedback at milestones",
  "Private Q&A with faculty",
  "Stream-only recordings for your access window",
  "Certificate with public verification",
  "Honest completion wording — not a degree or licence",
  "Small cohort, capped for real discussion",
  "Support within 48–72 hours on working days",
];

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs"
        title={
          <>
            Find the programme for <em className="italic">your next step.</em>
          </>
        }
        lead="Live cohorts, self-paced courses, therapy and supervision — each priced and paced for real life."
        image="/coastal/calm.jpg"
        imageAlt="Sunrise over a calm sea, with gentle surf reaching wet sand."
        caption="A calm sea at first light."
      />

      <section className="container pt-14 sm:pt-20">
        <span className={eyebrowVariants()}>{januaryCampaign.eyebrow}</span>
        <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
          {januaryCampaign.headline}
        </h2>
        <p className="text-muted-foreground mt-4 max-w-[52ch] text-lg">
          {januaryCampaign.supporting}
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {getCampaignCourses().map((course) => (
            <li key={course.slug}>
              <Link
                href={`/programs/${course.slug}`}
                className="border-border bg-card hover:border-primary/40 group flex h-full flex-col rounded-2xl border p-6 transition-colors"
              >
                <span className="text-foreground/45 text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
                  {course.category}
                </span>
                <h3 className="font-display text-foreground mt-3 text-2xl">
                  {course.title}
                </h3>
                <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                  {course.tagline}
                </p>
                <span className="text-primary mt-5 text-xs font-semibold tracking-[0.16em] uppercase">
                  Explore programme →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container pt-10">
        <Link
          href="/january-2027"
          className="bg-primary text-primary-foreground flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5"
        >
          <span>
            <b className="font-display block text-xl">
              January 2027 cohorts are open
            </b>
            <span className="text-sm opacity-80">
              Three live certificate cohorts. Early bird ₹1,999 until 15
              December.
            </span>
          </span>
          <span className="text-xs font-semibold tracking-[0.16em] uppercase">
            See January 2027 →
          </span>
        </Link>
      </section>

      <section className="container pb-20 sm:pb-28">
        <ProgramTabs />
      </section>

      <section className="bg-secondary py-20 sm:py-24">
        <div className="container">
          <span className={eyebrowVariants()}>Included in every cohort</span>
          <h2 className="font-display mt-4 mb-10 text-3xl tracking-tight sm:text-5xl">
            What you can count on.
          </h2>
          <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="text-primary mt-1 h-4 w-4 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container py-16">
        <div className="border-border flex flex-wrap items-center justify-between gap-4 border-t border-dashed pt-6 text-[0.72rem] font-semibold tracking-[0.2em] uppercase">
          <Link href="/resources" className="text-primary">
            Next · Resources →
          </Link>
          <Link href="/join" className="text-primary">
            Join us →
          </Link>
        </div>
      </section>
    </>
  );
}
