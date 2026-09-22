import { openGraphImage } from "@/lib/seo";
import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";
import Script from "next/script";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  Layers,
  Leaf,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import { ScrollReveal } from "@/components/ScrollReveal";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { ctaVariants } from "@/components/coastal/cta";
import VideoTestimonialsSection from "@/components/VideoTestimonialsSection";
import FaqAccordion from "@/components/course/faq-accordion";
import { cbtRebtCbmt, resolveCbtRebtCbmt } from "@/lib/cbt-rebt-cbmt-content";
import { CBT_LANDING_CONTENT_KEY } from "@/lib/site-content";
import type { CbtLandingOverride } from "@/lib/site-content";

export const revalidate = 60; // refresh admin-edited landing copy quickly

const PAGE_PATH = `/courses/${cbtRebtCbmt.slug}`;
const PAGE_URL = `https://www.themindpoint.org${PAGE_PATH}`;

async function getLandingOverride(): Promise<CbtLandingOverride | null> {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    const data = await convex.query(api.siteContent.getSiteContent, {
      key: CBT_LANDING_CONTENT_KEY,
    });
    return (data as CbtLandingOverride | null) ?? null;
  } catch (error) {
    console.warn("Failed to load CBT landing override:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const content = resolveCbtRebtCbmt(await getLandingOverride());
  const title = `${content.name} Certificate - The Mind Point`;
  return {
    title,
    description: content.description,
    keywords:
      "CBT course, REBT course, CBMT course, cognitive behavioural therapy certificate, rational emotive behaviour therapy, mindfulness based therapy, clinical supervision, psychology certificate",
    alternates: { canonical: PAGE_PATH },
    openGraph: {
      images: [openGraphImage],
      title,
      description: content.description,
      type: "website",
      url: PAGE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: content.description,
    },
  };
}

const LEARNING_ICONS = [Brain, RefreshCw, MessageCircle, Leaf, ShieldCheck];
const WHY_ICONS = [Layers, Users, Award, Check];

async function getEnrollableCourse() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    const courses = await convex.query(api.courses.listCourses, {});
    return (
      courses?.find((course) => course.code === cbtRebtCbmt.code) ??
      courses?.find(
        (course) =>
          course.type === "certificate" &&
          course.name.toLowerCase().includes("cbt"),
      ) ??
      null
    );
  } catch (error) {
    console.warn("Failed to find CBT course:", error);
    return null;
  }
}

export default async function CbtRebtCbmtPage() {
  const course = await getEnrollableCourse();
  const content = resolveCbtRebtCbmt(await getLandingOverride());
  const enrolHref = course
    ? `/courses/${course._id}`
    : `/contact?course=${content.slug}`;
  const enrolLabel = course
    ? content.closing.primaryLabel
    : content.closing.primaryFallbackLabel;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: content.name,
    description: content.description,
    provider: {
      "@type": "Organization",
      name: "The Mind Point",
      url: "https://www.themindpoint.org",
    },
    url: PAGE_URL,
    courseMode: "online",
    educationalLevel: "professional",
    inLanguage: "en",
    isAccessibleForFree: false,
    teaches: content.learningOutcomes.join("; "),
    ...(course
      ? {
          offers: {
            "@type": "Offer",
            price: Math.round(course.price || 0),
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: PAGE_URL,
          },
        }
      : {}),
  };

  return (
    <>
      <Script
        id="cbt-rebt-cbmt-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero */}
      <section className="py-14 sm:py-20">
        <div className="container grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className={eyebrowVariants()}>{content.eyebrow}</span>
            <h1 className="font-display mt-4 text-4xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              {content.name}
            </h1>
            <p className="font-display text-foreground/70 mt-4 text-2xl leading-snug italic sm:text-3xl">
              {content.tagline}
            </p>
            <p className="text-muted-foreground mt-5 max-w-2xl text-lg">
              {content.description}
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link href={enrolHref} className={ctaVariants({ layout: "flex" })}>
                {enrolLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={content.closing.secondaryHref}
                className="calm-link text-sm font-medium"
              >
                {content.closing.secondaryLabel}
              </Link>
            </div>

            <ul className="border-border mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-dashed pt-6">
              {content.proof.map((point) => (
                <li
                  key={point}
                  className="text-foreground/70 inline-flex items-center gap-2 text-sm"
                >
                  <Check className="text-primary h-4 w-4 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <aside className="border-border bg-card rounded-3xl border border-dashed p-7">
            <p className={eyebrowVariants({ size: "micro" })}>At a glance</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="text-primary h-4 w-4 shrink-0" />
                <dt className="text-muted-foreground w-24">Format</dt>
                <dd className="text-foreground">8-week live cohort</dd>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-primary h-4 w-4 shrink-0" />
                <dt className="text-muted-foreground w-24">Group</dt>
                <dd className="text-foreground">Small, capped cohort</dd>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="text-primary h-4 w-4 shrink-0" />
                <dt className="text-muted-foreground w-24">Covers</dt>
                <dd className="text-foreground">CBT · REBT · CBMT</dd>
              </div>
              <div className="flex items-center gap-3">
                <Award className="text-primary h-4 w-4 shrink-0" />
                <dt className="text-muted-foreground w-24">Finish</dt>
                <dd className="text-foreground">Certificate of completion</dd>
              </div>
            </dl>
            <Link
              href={enrolHref}
              className={`${ctaVariants({ layout: "flex" })} mt-7 w-full justify-center`}
            >
              {enrolLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>

      {/* Pain points */}
      <section className="section-padding bg-secondary/40">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <p className={eyebrowVariants()}>This is for you if</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              It&apos;s not you. It&apos;s the format.
            </h2>
            <ul className="mt-8 space-y-4">
              {content.painPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-1 h-5 w-5 shrink-0" />
                  <span className="text-foreground text-base leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="section-padding">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <p className={eyebrowVariants()}>What you&apos;ll learn</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Skills you can use in the room.
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.learningOutcomes.map((item, i) => {
                const Icon = LEARNING_ICONS[i] ?? Brain;
                return (
                  <li
                    key={item}
                    className="border-border bg-card flex items-start gap-3 rounded-xl border p-5"
                  >
                    <Icon className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                    <span className="text-foreground/85 text-sm leading-relaxed">
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* Curriculum */}
      <section className="section-padding bg-secondary/40">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <p className={eyebrowVariants()}>The eight weeks</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Week by week, into practice.
            </h2>
            <ol className="mt-8">
              {content.modules.map((module, i) => (
                <li
                  key={module.title}
                  className="border-foreground/10 flex gap-4 border-t py-5"
                >
                  <span className="calm-kbd mt-1 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-foreground text-base font-semibold">
                      {module.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </ScrollReveal>
        </div>
      </section>

      {/* Outcomes */}
      <section className="section-padding">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <p className={eyebrowVariants()}>What you walk away with</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Clear shifts, not vague promises.
            </h2>
            <ul className="mt-8 space-y-4">
              {content.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-3">
                  <ArrowRight className="text-primary mt-1 h-5 w-5 shrink-0" />
                  <span className="text-foreground/85 text-base leading-relaxed">
                    {outcome}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* Who it's for */}
      <section className="section-padding bg-secondary/40">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <p className={eyebrowVariants()}>Who it&apos;s for</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Built for people who want to practise.
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {content.whoItsFor.map((item) => (
                <div
                  key={item.title}
                  className="border-border bg-card rounded-2xl border p-6"
                >
                  <h3 className="text-foreground text-lg font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why different */}
      <section className="section-padding">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <p className={eyebrowVariants()}>Why this one</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Taught the way it should be.
            </h2>
            <div className="mt-8 space-y-4">
              {content.whyDifferent.map((item, i) => {
                const Icon = WHY_ICONS[i] ?? Check;
                return (
                  <div key={item} className="flex items-start gap-4">
                    <span className="bg-primary/8 flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                      <Icon className="text-primary h-5 w-5" />
                    </span>
                    <p className="text-foreground/85 pt-2 leading-relaxed">
                      {item}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <VideoTestimonialsSection />

      {/* FAQ */}
      <section className="calm-section-tight">
        <div className="calm-container">
          <ScrollReveal>
            <p className="calm-section-number">Questions</p>
            <h2 className="calm-section-title mt-5">
              In case you&apos;re wondering.
            </h2>
            <div className="mt-10">
              <FaqAccordion items={content.faqs} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-padding">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="border-border bg-card rounded-3xl border border-dashed px-7 py-12 text-center sm:px-12">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                {content.closing.headline}
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
                {content.closing.body}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={enrolHref}
                  className={ctaVariants({ layout: "flex" })}
                >
                  {enrolLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={content.closing.secondaryHref}
                  className="calm-link text-sm font-medium"
                >
                  {content.closing.secondaryLabel}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
