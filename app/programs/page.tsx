import { PageHero } from "@/components/coastal/PageHero";
import { ProgramTabs } from "@/components/coastal/ProgramTabs";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { Check } from "lucide-react";
import Link from "next/link";

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
      />

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
