"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function StructuredData() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return <StructuredDataContent />;
}

function StructuredDataContent() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "The Mind Point",
    description:
      "A platform for mental health education and support, offering comprehensive courses in psychology, counseling, and professional development.",
    url: "https://themindpoint.org",
    logo: "https://themindpoint.org/logo.png",
    sameAs: ["https://themindpoint.org"],
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "English",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Mental Health Education Courses",
      itemListElement: [
        "Certificate Courses",
        "Diploma Programs",
        "Therapy Sessions",
        "Supervised Sessions",
        "Internship Programs",
        "Masterclasses",
        "Resume Studio",
        "Worksheets",
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name,
          provider: {
            "@type": "EducationalOrganization",
            name: "The Mind Point",
            url: "https://themindpoint.org",
          },
        },
      })),
    },
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
