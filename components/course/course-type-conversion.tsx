"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { ScrollReveal } from "@/components/ScrollReveal";
import WhoShouldDo from "@/components/course/who-should-do";
import WhyChoose from "@/components/course/why-choose";
import FaqAccordion from "@/components/course/faq-accordion";
import VideoTestimonialsSection from "@/components/VideoTestimonialsSection";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { ctaVariants } from "@/components/coastal/cta";
import { getOfferDetails, showRupees } from "@/lib/utils";
import type { CourseTypeContentBundle } from "@/lib/course-type-content";
import type { PublicCourse } from "@/lib/backend";

interface ActiveOffer {
  offerName: string;
  discountLabel: string;
  offerPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  hasBogo: boolean;
  timeLeft: { days: number; hours: number; minutes: number };
}

// Offers depend on the current time, so resolve them after mount to keep the
// server-rendered HTML and the first client render identical.
function useActiveOffer(courses: PublicCourse[]): ActiveOffer | null {
  const [offer, setOffer] = useState<ActiveOffer | null>(null);

  useEffect(() => {
    const resolved = courses
      .map((course) => getOfferDetails(course))
      .filter((details): details is NonNullable<typeof details> =>
        Boolean(details),
      );

    if (resolved.length === 0) {
      setOffer(null);
      return;
    }

    const withDiscount = resolved
      .filter((details) => details.hasDiscount)
      .sort((a, b) => b.savingsAmount - a.savingsAmount);
    const best = withDiscount[0] ?? resolved[0];

    setOffer({
      offerName: best.offerName,
      discountLabel: best.discountLabel,
      offerPrice: best.offerPrice,
      originalPrice: best.originalPrice,
      hasDiscount: best.hasDiscount,
      hasBogo: best.hasBogo,
      timeLeft: best.timeLeft,
    });
  }, [courses]);

  return offer;
}

function OfferBand({ courses }: { courses: PublicCourse[] }) {
  const offer = useActiveOffer(courses);
  if (!offer) return null;

  const { days, hours, minutes } = offer.timeLeft;
  const timeLeftLabel =
    days > 0
      ? `${days}d ${hours}h left`
      : hours > 0
        ? `${hours}h ${minutes}m left`
        : minutes > 0
          ? `${minutes}m left`
          : null;

  return (
    <section className="container pt-8">
      <ScrollReveal>
        <div className="border-primary/25 bg-primary/[0.04] flex flex-col gap-4 rounded-2xl border border-dashed px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={eyebrowVariants({ size: "micro" })}>
              {offer.hasBogo && !offer.hasDiscount
                ? "Limited-time offer"
                : offer.offerName}
            </p>
            <p className="text-foreground mt-2 text-lg font-medium">
              {offer.hasDiscount && (
                <>
                  Save {offer.discountLabel} — now{" "}
                  <span className="text-primary">
                    {showRupees(offer.offerPrice)}
                  </span>{" "}
                  <span className="text-muted-foreground line-through">
                    {showRupees(offer.originalPrice)}
                  </span>
                </>
              )}
              {!offer.hasDiscount && offer.hasBogo && (
                <>Includes a free bonus course of your choice.</>
              )}
            </p>
            {timeLeftLabel && (
              <p className="text-muted-foreground mt-1 text-sm">
                {timeLeftLabel}
              </p>
            )}
          </div>
          <a href="#courses" className={ctaVariants({ layout: "flex" })}>
            Claim this offer
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}

function PainPoints({ points }: { points: string[] }) {
  if (points.length === 0) return null;

  return (
    <section className="section-padding bg-secondary/40">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <p className={eyebrowVariants()}>This is for you if</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
            It&apos;s not you. It&apos;s the format.
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 h-5 w-5 shrink-0" />
                <span className="text-foreground text-base leading-relaxed">
                  {point}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-primary mt-8 font-medium">
            If that feels familiar, you&apos;re in the right place.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function Outcomes({ outcomes }: { outcomes: string[] }) {
  if (outcomes.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <p className={eyebrowVariants()}>What you walk away with</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
            Clear shifts, not vague promises.
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {outcomes.map((outcome) => (
              <li
                key={outcome}
                className="border-border bg-card flex items-start gap-3 rounded-xl border p-5"
              >
                <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-foreground/85 text-sm leading-relaxed">
                  {outcome}
                </span>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}

function TypeFaq({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  if (faqs.length === 0) return null;

  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <p className="calm-section-number">Questions</p>
          <h2 className="calm-section-title mt-5">
            In case you&apos;re wondering.
          </h2>
          <div className="mt-10">
            <FaqAccordion items={faqs} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function ClosingCta({
  closing,
}: {
  closing: CourseTypeContentBundle["closing"];
}) {
  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <div className="border-border bg-card rounded-3xl border border-dashed px-7 py-12 text-center sm:px-12">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
              {closing.headline}
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
              {closing.body}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={closing.primaryHref}
                className={ctaVariants({ layout: "flex" })}
              >
                {closing.primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href={closing.secondaryHref}
                className="calm-link text-sm font-medium"
              >
                {closing.secondaryLabel}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

interface CourseTypeConversionProps {
  content: CourseTypeContentBundle;
  courses: PublicCourse[];
  showFaq?: boolean;
}

export default function CourseTypeConversion({
  content,
  courses,
  showFaq = true,
}: CourseTypeConversionProps) {
  const who = content.whoShouldDo;
  const why = content.whyChoose;

  return (
    <>
      <OfferBand courses={courses} />
      <PainPoints points={content.painPoints} />
      <Outcomes outcomes={content.outcomes} />
      {who.items.length > 0 && (
        <WhoShouldDo
          title={who.title}
          description={who.description}
          items={who.items}
        />
      )}
      {why.items.length > 0 && (
        <WhyChoose
          title={why.title}
          description={why.description}
          items={why.items}
        />
      )}
      <VideoTestimonialsSection />
      {showFaq && <TypeFaq faqs={content.faqs} />}
      <ClosingCta closing={content.closing} />
    </>
  );
}
