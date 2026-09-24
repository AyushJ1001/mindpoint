import { PageHero } from "@/components/coastal/PageHero";
import { JoinForm } from "@/components/coastal/JoinForm";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
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
        imageAlt="Sunrise over a calm sea, with gentle surf reaching wet sand."
        caption="A calm sea at first light."
      />

      <section className="container pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {ROUTES.map((r) => (
            <div
              key={r.title}
              className="border-border bg-card flex flex-col rounded border p-7"
            >
              <span className="text-primary text-[0.68rem] font-semibold tracking-[0.24em] uppercase">
                {r.label}
              </span>
              <h3 className="font-display mt-3 text-2xl">{r.title}</h3>
              <p className="text-muted-foreground mt-2 flex-1">{r.copy}</p>
              <Link
                href={r.href}
                className="text-primary mt-5 text-sm font-semibold"
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
            <span className={eyebrowVariants()}>Say hello</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              Tell us what you need.
            </h2>
            <p className="text-muted-foreground mt-4">
              We&apos;ll reply within 48–72 hours on working days. Tell us who
              you are and where you&apos;d like to go.
            </p>
            <div className="border-border bg-card mt-8 rounded border border-dashed p-6">
              <b>In crisis?</b> Please contact a local helpline or emergency
              service immediately. We are not an emergency service.
            </div>
          </div>
          <JoinForm />
        </div>
      </section>

      <section className="container py-16">
        <div className="border-border flex flex-wrap items-center justify-between gap-4 border-t border-dashed pt-6 text-[0.72rem] font-semibold tracking-[0.2em] uppercase">
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
