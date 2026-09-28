import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { ctaVariants } from "@/components/coastal/cta";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { getGuide, guideSlugs } from "@/lib/guides";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found — The Mind Point" };

  return {
    title: guide.metaTitle,
    description: guide.description,
    alternates: { canonical: `/resources/${guide.slug}` },
    openGraph: {
      title: guide.metaTitle,
      description: guide.description,
      type: "article",
      url: `https://www.themindpoint.org/resources/${guide.slug}`,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const url = `https://www.themindpoint.org/resources/${guide.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    url,
    mainEntityOfPage: url,
    inLanguage: "en-IN",
    dateModified: "2026-09-28",
    author: {
      "@type": "Organization",
      name: "The Mind Point",
      url: "https://www.themindpoint.org",
    },
    publisher: {
      "@type": "Organization",
      name: "The Mind Point",
      url: "https://www.themindpoint.org",
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="pt-14 pb-20 sm:pt-20">
        <div className="container max-w-3xl">
          <Link
            href="/resources"
            className="text-muted-foreground hover:text-foreground text-[0.7rem] font-semibold tracking-[0.22em] uppercase"
          >
            ← Resources
          </Link>
          <span className={`${eyebrowVariants()} mt-8 block`}>Guide</span>
          <h1 className="font-display text-foreground mt-4 text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            {guide.title}
          </h1>
          <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
            {guide.intro}
          </p>
          <p className="text-muted-foreground border-border mt-6 border-t border-dashed pt-4 text-xs tracking-[0.16em] uppercase">
            {guide.readMinutes} min read · Updated {guide.updated}
          </p>

          <div className="mt-12 space-y-12">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-foreground/80 mt-4 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-5 space-y-3">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="text-primary mt-1 h-4 w-4 shrink-0" />
                        <span className="text-foreground/80 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <div className="water-band-mist mt-14 rounded-2xl p-8">
            <h2 className="font-display text-2xl tracking-tight">
              {guide.cta.label}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {guide.cta.note}
            </p>
            <Link
              href={guide.cta.href}
              className={`mt-5 ${ctaVariants({ layout: "flex" })}`}
            >
              Take the next step <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="border-border mt-14 border-t border-dashed pt-8">
            <h2 className="font-display mb-4 text-2xl tracking-tight">
              Common questions
            </h2>
            {guide.faq.map((item) => (
              <details key={item.q} className="faq-item py-4">
                <summary className="font-display text-lg leading-snug">
                  {item.q}
                </summary>
                <p className="text-muted-foreground mt-2 max-w-prose">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
