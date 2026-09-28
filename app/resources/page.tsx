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
  {
    title: "Why can't I stop overthinking?",
    copy: "Why the mind loops, and what actually helps.",
    action: "Read",
    href: "/resources/stop-overthinking",
  },
  {
    title: "How to choose a psychology course",
    copy: "What to look for — and what to be wary of.",
    action: "Read",
    href: "/resources/choosing-a-psychology-course",
  },
  {
    title: "CBT exercises for anxiety",
    copy: "Three core exercises you can start today.",
    action: "Read",
    href: "/resources/cbt-exercises",
  },
  {
    title: "How to verify a certificate",
    copy: "Check any The Mind Point certificate in seconds.",
    action: "Verify",
    href: "/verify",
  },
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
          {RESOURCES.map((resource) => (
            <Link
              key={resource.title}
              href={resource.href}
              className="border-border hover:bg-card flex items-center justify-between gap-4 border-b border-dashed py-6 transition-colors"
            >
              <div>
                <h3 className="font-display text-xl">{resource.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {resource.copy}
                </p>
              </div>
              <span className="text-primary text-[0.7rem] font-semibold tracking-[0.18em] whitespace-nowrap uppercase">
                {resource.action}
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
