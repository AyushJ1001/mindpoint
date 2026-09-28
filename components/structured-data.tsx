"use client";

import { usePathname } from "next/navigation";

import { GOOGLE_RATING } from "@/lib/googleReviews";

const SITE = "https://www.themindpoint.org";

export default function StructuredData() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return <StructuredDataContent />;
}

function StructuredDataContent() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE}/#organization`,
        name: "The Mind Point",
        alternateName: "TMP",
        description:
          "Psychology education for adults in India: self-paced intro courses, live certificate cohorts, supervision and therapy. Structured, evidence-based teaching with honest certificates.",
        url: SITE,
        logo: `${SITE}/logo.png`,
        sameAs: [
          "https://instagram.com/themindpoint",
          "https://www.facebook.com/themindpoint",
        ],
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
        },
        areaServed: {
          "@type": "Country",
          name: "India",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "English",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: GOOGLE_RATING.average.toFixed(1),
          reviewCount: String(GOOGLE_RATING.count),
          bestRating: "5",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Psychology courses and support",
          itemListElement: [
            "Intro courses (self-paced)",
            "Certificate Courses",
            "Diploma Programs",
            "Therapy Sessions",
            "Supervised Sessions",
            "Internship Programs",
            "Masterclasses",
            "Worksheets",
          ].map((name) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Course",
              name,
              provider: { "@id": `${SITE}/#organization` },
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE,
        name: "The Mind Point",
        inLanguage: "en-IN",
        publisher: { "@id": `${SITE}/#organization` },
      },
    ],
  };

  return (
    <script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
