import { PageHero } from "@/components/coastal/PageHero";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Community - The Mind Point",
  description:
    "A small, moderated community of people who take mental health seriously, gently.",
  alternates: { canonical: "/community" },
};

const STORIES = [
  ["I finally understood why my mind keeps overthinking everything. The tools actually work.", "S.K. · Intern"],
  ["I came in confused about my career. Now I'm a practising counsellor.", "R.M. · Certificate graduate"],
  ["What sets TMP apart is the community. You're never learning alone.", "A.P. · Diploma student"],
];

const SUPPORT = [
  ["Support within 48–72 hours", "Assigned faculty answer on working days — not a bot, not a queue."],
  ["Your cohort, private", "A small, moderated space to ask and learn without performing."],
  ["Question & answer", "Ask openly or privately. Faculty answers are labelled and visible."],
];

const GUIDELINES = [
  "Be kind — everyone here is learning.",
  "Keep others' stories private.",
  "No medical advice or diagnosis between members.",
  "Consent before recording or sharing anything.",
];

export default function CommunityPage() {
  return (
    <>
      <PageHero
        eyebrow="Community"
        title={
          <>
            You&apos;re never <em className="italic">learning alone.</em>
          </>
        }
        lead="A small, moderated community of people who take mental health seriously, gently."
        image="/coastal/hero.jpg"
      />

      <section className="container pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {STORIES.map(([quote, who]) => (
            <figure key={who} className="border-t-2 border-primary pt-5">
              <blockquote className="font-display text-2xl italic leading-snug">
                “{quote}”
              </blockquote>
              <figcaption className="mt-4 text-[0.68rem] tracking-[0.24em] text-muted-foreground uppercase">
                {who}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <hr className="container border-0 border-t border-dashed border-border" />

      <section className="container py-20 sm:py-24">
        <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
          How we support you
        </span>
        <h2 className="font-display mt-4 mb-10 text-3xl tracking-tight sm:text-5xl">
          Real people, real answers.
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {SUPPORT.map(([title, copy]) => (
            <div key={title} className="rounded border border-border bg-card p-7">
              <h3 className="font-display text-xl">{title}</h3>
              <p className="mt-2 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-24">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded">
            <Image
              src="/coastal/wave.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
              Community guidelines
            </span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Kind, private, and honest about limits.
            </h2>
            <ul className="mt-6 space-y-3">
              {GUIDELINES.map((g) => (
                <li key={g} className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-border pt-6 text-[0.72rem] font-semibold tracking-[0.2em] uppercase">
          <Link href="/about" className="text-primary">
            About →
          </Link>
          <Link href="/join" className="text-primary">
            Join us →
          </Link>
        </div>
      </section>
    </>
  );
}
