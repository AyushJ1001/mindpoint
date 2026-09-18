import { PageHero } from "@/components/coastal/PageHero";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About Us - The Mind Point",
  description:
    "Learn about The Mind Point's mission to transform mental health education through compassionate, evidence-based programs and professional development.",
  keywords:
    "about us, mental health education, psychology courses, professional development, The Mind Point mission",
  openGraph: {
    title: "About Us - The Mind Point",
    description:
      "Learn about The Mind Point's mission to transform mental health education.",
    type: "website",
  },
  alternates: { canonical: "/about" },
};

const TEACH = [
  ["Evidence, not vibes", "Every method we teach has a research base, and we say plainly where the evidence is thin."],
  ["Practice, not just theory", "Live cohorts and supervision put the skills in your hands, not just your notes."],
  ["Honest certificates", "Completion, never a degree or licence — and every certificate is publicly verifiable."],
  ["Small and human", "Cohorts stay small so teaching stays personal. You are never a number here."],
  ["Built for India", "Paced for real life, phone-first, and priced for where our students actually are."],
  ["Support that shows up", "Faculty answer within 48–72 hours on working days. Real people, not a bot."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            We teach the mind with <em className="italic">warmth and rigour.</em>
          </>
        }
        lead="The Mind Point is a learning home for psychology students, career changers and practising therapists in India."
        image="/coastal/shore.jpg"
      />

      <section className="container grid gap-12 pb-20 lg:grid-cols-2">
        <div>
          <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
            Why we exist
          </span>
          <h2 className="font-display mt-4 text-3xl leading-tight tracking-tight sm:text-5xl">
            A learning home for people who take mental health seriously — and
            gently.
          </h2>
        </div>
        <div>
          <p className="text-lg leading-8 text-muted-foreground">
            The Mind Point began as a small practice and a big frustration: too
            much mental-health training was either cold and clinical, or warm
            but vague. We wanted both rigour and humanity in one place.
          </p>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Today we run live cohorts, self-paced courses and therapy for
            psychology students, career changers and practising therapists
            across India.
          </p>
        </div>
      </section>

      <hr className="container border-0 border-t border-dashed border-border" />

      <section className="container py-20 sm:py-24">
        <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
          How we teach
        </span>
        <h2 className="font-display mt-4 mb-10 text-3xl tracking-tight sm:text-5xl">
          Four things we refuse to compromise on.
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {TEACH.map(([title, copy]) => (
            <div key={title} className="border-t border-dashed border-border pt-4">
              <b className="font-display block text-xl font-medium">{title}</b>
              <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
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
              Our promise on honesty
            </span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              No accreditation claims. No career guarantees.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We removed every claim we couldn&apos;t document. What remains is
              what we can stand behind: real teaching, real practice, and
              certificates that state only what you completed.
            </p>
            <Link
              href="/programs"
              className="mt-6 inline-block rounded-full bg-primary px-7 py-3.5 text-xs font-medium tracking-[0.16em] text-primary-foreground uppercase"
            >
              See our programs →
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-border pt-6 text-[0.72rem] font-semibold tracking-[0.2em] uppercase">
          <Link href="/programs" className="text-primary">
            Next · Programs →
          </Link>
          <Link href="/join" className="text-primary">
            Join us →
          </Link>
        </div>
      </section>
    </>
  );
}
