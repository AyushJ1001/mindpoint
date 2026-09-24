import { PageHero } from "@/components/coastal/PageHero";
import { EmailCapture } from "@/components/coastal/EmailCapture";
import { ctaVariants } from "@/components/coastal/cta";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Resources - The Mind Point",
  description:
    "Guides, downloads and a free recorded masterclass — no card required.",
  alternates: { canonical: "/resources" },
};

const RESOURCES = [
  [
    "Understanding overthinking",
    "A short guide to why the mind loops, and what actually helps.",
    "Read",
  ],
  [
    "Choosing a therapy path",
    "What to look for in a programme — and what to be wary of.",
    "Read",
  ],
  [
    "CBT tool pack",
    "Printable exercises for anxiety and overthinking.",
    "Download",
  ],
  [
    "How to verify a certificate",
    "Check any The Mind Point certificate in seconds.",
    "Verify",
  ],
];

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title={
          <>
            Free tools to start <em className="italic">before you commit.</em>
          </>
        }
        lead="Guides, downloads and one full recorded masterclass — no card required."
        image="/coastal/wave.jpg"
        imageAlt="A wave breaking near the shore, spray catching the light."
        caption="A wave breaking near the shore."
      />

      <section className="container pb-20">
        <div className="border-border bg-secondary max-w-2xl rounded border border-dashed p-8">
          <span className={eyebrowVariants()}>Free masterclass</span>
          <h2 className="font-display mt-3 text-2xl sm:text-3xl">
            Watch one full session, free.
          </h2>
          <p className="text-muted-foreground mt-2">
            No card, no pressure — just a real taste of how we teach.
          </p>
          <EmailCapture source="resources" />
        </div>
      </section>

      <section className="container pb-20 sm:pb-28">
        <span className={eyebrowVariants()}>Guides &amp; tools</span>
        <h2 className="font-display mt-4 mb-8 text-3xl tracking-tight sm:text-5xl">
          Start before you commit.
        </h2>
        <div className="border-primary border-t-2">
          {RESOURCES.map(([title, copy, action]) => (
            <Link
              key={title}
              href="/contact"
              className="border-border hover:bg-card flex items-center justify-between gap-4 border-b border-dashed py-6 transition-colors"
            >
              <div>
                <h3 className="font-display text-xl">{title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{copy}</p>
              </div>
              <span className="text-primary text-[0.7rem] font-semibold tracking-[0.18em] whitespace-nowrap uppercase">
                {action}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-24">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className={eyebrowVariants()}>Not sure where to start?</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Tell us where you are, we&apos;ll point the way.
            </h2>
            <p className="text-muted-foreground mt-4">
              Answer one line on the home page and we&apos;ll recommend a next
              step. No form, no sales call.
            </p>
            <Link href="/#programs" className={`mt-6 ${ctaVariants()}`}>
              Find your path →
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded">
            <Image
              src="/coastal/shore.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
