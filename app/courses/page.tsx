import type { Metadata } from "next";
import CoursesClient from "@/components/CoursesClient";
import Script from "next/script";

export const metadata: Metadata = {
  title: "All Courses - The Mind Point",
  description:
    "Explore our comprehensive collection of mental health courses, including certificate programs, diplomas, internships, therapy sessions, and professional development courses.",
  keywords:
    "mental health courses, psychology courses, certificate programs, diploma courses, therapy sessions, counseling courses, professional development, online learning",
  openGraph: {
    title: "All Courses - The Mind Point",
    description:
      "Explore our comprehensive collection of mental health courses and professional development programs.",
    type: "website",
    url: "https://themindpoint.org/courses",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Courses - The Mind Point",
    description:
      "Explore our comprehensive collection of mental health courses and professional development programs.",
  },
};

// Structured data for the course catalog
const coursesStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Mental Health Education Courses",
  description:
    "Comprehensive collection of mental health courses, certificate programs, diplomas, and professional development courses",
  url: "https://themindpoint.org/courses",
  numberOfItems: "50+",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Course",
        name: "Certificate Courses",
        description:
          "Professional certification programs in psychology and mental health",
        url: "https://themindpoint.org/courses/certificate",
        provider: {
          "@type": "Organization",
          name: "The Mind Point",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Course",
        name: "Diploma Programs",
        description:
          "Comprehensive diploma courses for in-depth knowledge and expertise",
        url: "https://themindpoint.org/courses/diploma",
        provider: {
          "@type": "Organization",
          name: "The Mind Point",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Course",
        name: "Therapy Sessions",
        description:
          "Professional therapy and counseling services for mental wellness",
        url: "https://themindpoint.org/courses/therapy",
        provider: {
          "@type": "Organization",
          name: "The Mind Point",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "Course",
        name: "Internship Programs",
        description:
          "Hands-on experience through structured internship opportunities",
        url: "https://themindpoint.org/courses/internship",
        provider: {
          "@type": "Organization",
          name: "The Mind Point",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 5,
      item: {
        "@type": "Course",
        name: "Masterclasses",
        description:
          "Intensive sessions with industry experts and thought leaders",
        url: "https://themindpoint.org/courses/masterclass",
        provider: {
          "@type": "Organization",
          name: "The Mind Point",
        },
      },
    },
  ],
};

export default function CoursesPage() {
  return (
    <>
      <Script
        id="courses-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(coursesStructuredData),
        }}
      />
      <CoursesClient />
    </>
  );
}
