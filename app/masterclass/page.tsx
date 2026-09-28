import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { LeadCaptureForm } from "@/components/coastal/LeadCaptureForm";
import { LmsMediaPlayer } from "@/components/lms/LmsMediaPlayer";
import { ctaVariants } from "@/components/coastal/cta";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { MASTERCLASS, MASTERCLASS_VIDEO_URL } from "@/lib/free-content";
import { openGraphImage } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Free masterclass — see how The Mind Point teaches",
  description:
    "Watch a free recorded masterclass from The Mind Point. Structured, practical psychology teaching for students, career changers and practising therapists in India. No card, no pressure.",
  alternates: { canonical: "/masterclass" },
  openGraph: {
    images: [openGraphImage],
    title: "Free masterclass — see how The Mind Point teaches",
    description:
      "A free recorded session that shows how we teach, before you commit to a programme.",
    type: "website",
    url: "https://www.themindpoint.org/masterclass",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: MASTERCLASS.faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function MasterclassPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="pt-14 pb-10 sm:pt-20">
        <div className="container">
          <span className={eyebrowVariants()}>{MASTERCLASS.eyebrow}</span>
          <h1 className="font-display text-foreground mt-5 max-w-[20ch] text-4xl leading-[1.03] tracking-[-0.03em] sm:text-6xl">
            {MASTERCLASS.title}
          </h1>
          <p className="font-display text-primary mt-6 max-w-[34ch] text-2xl leading-[1.2] italic sm:text-3xl">
            {MASTERCLASS.supporting}
          </p>
          <p className="text-muted-foreground mt-7 max-w-[62ch] text-lg leading-relaxed">
            {MASTERCLASS.description}
          </p>
        </div>
      </section>

      <section className="pb-14 sm:pb-20">
        <div className="container grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            {MASTERCLASS_VIDEO_URL ? (
              <LmsMediaPlayer
                url={MASTERCLASS_VIDEO_URL}
                title="The Mind Point free masterclass"
              />
            ) : (
              <div className="border-border bg-secondary flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed p-8 text-center">
                <p className="text-muted-foreground max-w-sm text-sm">
                  The masterclass player appears here once the recording is
                  connected. Leave your details and we&rsquo;ll send it to you
                  directly in the meantime.
                </p>
              </div>
            )}
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {MASTERCLASS.takeaways.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="text-primary mt-1 h-4 w-4 shrink-0" />
                  <span className="text-foreground/80 text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="water-band-mist rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-2xl tracking-tight">
              Get the masterclass
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Enter your email and we&rsquo;ll send the session. Add a WhatsApp
              number if you&rsquo;d like the nudge there instead.
            </p>
            <div className="mt-6">
              <LeadCaptureForm source="masterclass-page" />
            </div>
          </div>
        </div>
      </section>

      <section className="water-band-mist border-border border-y border-dashed py-16 sm:py-20">
        <div className="container flex flex-col items-center gap-5 text-center">
          <h2 className="font-display max-w-2xl text-3xl tracking-tight sm:text-4xl">
            Liked it? The rest is a small, structured next step.
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Start with a ₹999 self-paced intro to find your footing, then join a
            live January 2027 cohort when you&rsquo;re ready.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/courses" className={ctaVariants({ layout: "flex" })}>
              Explore courses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/january-2027"
              className="border-primary/30 text-primary hover:bg-primary/5 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase"
            >
              See January 2027
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className={eyebrowVariants()}>Questions</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              A few honest answers.
            </h2>
          </div>
          <div className="border-border border-t border-dashed">
            {MASTERCLASS.faq.map((item) => (
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
    </>
  );
}
