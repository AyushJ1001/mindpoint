import { PageHero } from "@/components/coastal/PageHero";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Community | The Mind Point",
  description:
    "A small, moderated community of people who take mental health seriously, gently.",
  alternates: { canonical: "/community" },
};

const STORIES = [
  [
    "I finally understood why my mind keeps overthinking everything. The tools actually work.",
    "S.K. · Intern",
  ],
  [
    "I came in confused about my career. Now I'm a practising counsellor.",
    "R.M. · Certificate graduate",
  ],
  [
    "What sets TMP apart is the community. You're never learning alone.",
    "A.P. · Diploma student",
  ],
];

const SUPPORT = [
  [
    "Support within 48–72 hours",
    "Assigned faculty answer on working days — not a bot, not a queue.",
  ],
  [
    "Your cohort, private",
    "A small, moderated space to ask and learn without performing.",
  ],
  [
    "Question & answer",
    "Ask openly or privately. Faculty answers are labelled and visible.",
  ],
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
        imageAlt="Turquoise water meeting pale sand, seen from above."
        caption="A coastline, seen from above."
      />

      <section className="container pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {STORIES.map(([quote, who]) => (
            <figure key={who} className="border-primary border-t-2 pt-5">
              <blockquote className="font-display text-2xl leading-snug italic">
                “{quote}”
              </blockquote>
              <figcaption className="text-muted-foreground mt-4 text-[0.68rem] tracking-[0.24em] uppercase">
                {who}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="community-links-heading"
        className="container pb-20"
      >
        <span className={eyebrowVariants()}>Join us</span>
        <h2
          id="community-links-heading"
          className="font-display mt-4 max-w-2xl text-3xl tracking-tight sm:text-4xl"
        >
          Where the conversation continues.
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <a
            href="https://chat.whatsapp.com/FLyMm3KharJALfuovgiuHe"
            target="_blank"
            rel="noopener noreferrer"
            className="border-brand-gold/40 bg-card rounded-brand group border p-6"
          >
            <b className="font-display text-brand-heading block text-xl">
              Join Our WhatsApp Community
            </b>
            <span className="text-brand-body mt-2 block text-sm leading-relaxed">
              Connect with The Mind Point community for course announcements,
              learning opportunities, workshops and important updates.
            </span>
            <span className="text-brand-teal mt-4 inline-block text-sm font-semibold underline-offset-4 group-hover:underline">
              Open WhatsApp →
            </span>
          </a>
          <a
            href="https://www.instagram.com/channel/AbZNVUaQ3yMrfJGm/"
            target="_blank"
            rel="noopener noreferrer"
            className="border-brand-gold/40 bg-card rounded-brand group border p-6"
          >
            <b className="font-display text-brand-heading block text-xl">
              Join Our Instagram Community
            </b>
            <span className="text-brand-body mt-2 block text-sm leading-relaxed">
              Stay connected through announcements, psychology insights,
              upcoming programs and community updates.
            </span>
            <span className="text-brand-teal mt-4 inline-block text-sm font-semibold underline-offset-4 group-hover:underline">
              Open Instagram channel →
            </span>
          </a>
        </div>
        <p className="text-brand-body/70 mt-6 max-w-2xl text-xs leading-relaxed">
          Joining either community is optional and is not required to access a
          course you have purchased. Communities are hosted by WhatsApp and
          Instagram, and your profile visibility there is governed by those
          platforms.
        </p>
      </section>

      <hr className="border-border container border-0 border-t border-dashed" />

      <section className="container py-20 sm:py-24">
        <span className={eyebrowVariants()}>How we support you</span>
        <h2 className="font-display mt-4 mb-10 text-3xl tracking-tight sm:text-5xl">
          Real people, real answers.
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {SUPPORT.map(([title, copy]) => (
            <div
              key={title}
              className="border-border bg-card rounded border p-7"
            >
              <h3 className="font-display text-xl">{title}</h3>
              <p className="text-muted-foreground mt-2">{copy}</p>
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
            <span className={eyebrowVariants()}>Community guidelines</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Kind, private, and honest about limits.
            </h2>
            <ul className="mt-6 space-y-3">
              {GUIDELINES.map((g) => (
                <li key={g} className="flex items-start gap-3">
                  <Check className="text-primary mt-1 h-4 w-4 shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="border-border flex flex-wrap items-center justify-between gap-4 border-t border-dashed pt-6 text-[0.72rem] font-semibold tracking-[0.2em] uppercase">
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
