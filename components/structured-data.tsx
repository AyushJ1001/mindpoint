"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Script from "next/script";

export default function StructuredData() {
  const allCourses = useQuery(api.courses.listCourses, { count: undefined });

  if (!allCourses) return null;

  // Group courses by type
  const courseGroups = allCourses.reduce(
    (acc, course) => {
      const type = course.type || "other";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(course);
      return acc;
    },
    {} as Record<string, typeof allCourses>,
  );

  // Create structured data for each course type
  const courseOffers = Object.entries(courseGroups)
    .map(([type, courses]) => {
      const firstCourse = courses[0];
      if (!firstCourse) return null;

      // Get the display name based on course type
      let displayName = "";
      switch (type) {
        case "certificate":
          displayName = "Certificate Courses";
          break;
        case "diploma":
          displayName = "Diploma Programs";
          break;
        case "therapy":
          displayName = "Therapy Sessions";
          break;
        case "supervised":
          displayName = "Supervised Sessions";
          break;
        case "internship":
          displayName = "Internship Programs";
          break;
        case "masterclass":
          displayName = "Masterclass Sessions";
          break;
        case "resume-studio":
          displayName = "Resume Studio";
          break;
        default:
          displayName = firstCourse.name;
      }

      // Get description based on course type
      let description = "";
      switch (type) {
        case "certificate":
          description =
            "Professional certification programs in psychology and mental health";
          break;
        case "diploma":
          description =
            "Comprehensive diploma courses for in-depth knowledge and expertise";
          break;
        case "therapy":
          description =
            "Professional therapy and counseling services for mental wellness";
          break;
        case "supervised":
          description =
            "Supervised clinical sessions for professional development";
          break;
        case "internship":
          description =
            "Hands-on internship programs with real-world experience";
          break;
        case "masterclass":
          description = "Expert-led masterclass sessions for advanced learning";
          break;
        case "resume-studio":
          description =
            "Professional resume building and career guidance services";
          break;
        default:
          description =
            firstCourse.description || "Professional development course";
      }

      return {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: displayName,
          description: description,
          provider: {
            "@type": "EducationalOrganization",
            name: "The Mind Point",
            url: "https://themindpoint.org",
          },
          offers: {
            "@type": "Offer",
            price: firstCourse.price?.toString() || "0",
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
          },
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "https://schema.org/Online",
            courseSchedule: "Flexible",
          },
        },
      };
    })
    .filter(Boolean);

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
      itemListElement: courseOffers,
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
