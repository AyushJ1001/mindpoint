import { PageHero } from "@/components/coastal/PageHero";
import { JoinForm } from "@/components/coastal/JoinForm";
import Link from "next/link";

export const metadata = {
  title: "Join us - The Mind Point",
  description:
    "Enrol in a cohort, book a therapy session, or ask about supervision. We reply like people, because we are.",
  alternates: { canonical: "/join" },
};

const ROUTES = [
  {
    label: "For learners",
    title: "Enrol in a cohort",
    copy: "Small, live and practical. Pick your programme and we'll take it from there.",
    cta: "See programs",
    href: "/programs",
  },
  {
    label: "For yourself",
    title: "Book a session",
    copy: "One calm conversation with a licensed professional, from ₹600.",
    cta: "Book now",
    href: "/contact",
  },
  {
    label: "For practitioners",
    title: "Ask about supervision",
    copy: "Structured supervision and peer community for practising therapists.",
    cta: "Enquire",
    href: "#contact",
  },
];

export default function JoinPage() {
  return (
    <>
      <PageHero
        eyebrow="Join us"
        title={
          <>
            Take the next step that <em className="italic">feels kind.</em>
          </>
        }
        lead="Enrol, book a session, or just ask a question. We reply like people, because we are."
        image="/coastal/calm.jpg"
      />

      <section className="container pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {ROUTES.map((r) => (
            <div
              key={r.title}
              className="flex flex-col rounded border border-border bg-card p-7"
            >
              <span className="text-[0.68rem] font-semibold tracking-[0.24em] text-primary uppercase">
                {r.label}
              </span>
              <h3 className="font-display mt-3 text-2xl">{r.title}</h3>
              <p className="mt-2 flex-1 text-muted-foreground">{r.copy}</p>
              <Link
                href={r.href}
                className="mt-5 text-sm font-semibold text-primary"
              >
                {r.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="bg-secondary py-20 sm:py-24">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
              Say hello
            </span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              Tell us what you need.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We&apos;ll reply within 48–72 hours on working days. Tell us who
              you are and where you&apos;d like to go.
            </p>
            <div className="mt-8 rounded border border-dashed border-border bg-card p-6">
              <b>In crisis?</b> Please contact a local helpline or emergency
              service immediately. We are not an emergency service.
            </div>
          </div>
          <JoinForm />
        </div>
      </section>

      <section className="container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-border pt-6 text-[0.72rem] font-semibold tracking-[0.2em] uppercase">
          <Link href="/" className="text-primary">
            ← Back to home
          </Link>
          <Link href="/programs" className="text-primary">
            Programs →
          </Link>
        </div>
      </section>
    </>
  );
}
