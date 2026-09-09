import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";
import CoursesClient from "@/components/CoursesClient";
import CoursesHero from "@/components/CoursesHero";
import Script from "next/script";
import { Suspense } from "react";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Programs - The Mind Point",
  description:
    "Explore psychology certificate courses, diplomas, internships, supervised learning, therapy sessions, masterclasses, and flexible self-paced programs from The Mind Point.",
  keywords:
    "psychology courses, mental health education, certificate programs, diploma courses, internships, therapy sessions, supervised learning, online psychology courses",
  openGraph: {
    title: "Programs - The Mind Point",
    description:
      "Psychology education, practical training, supervised learning, and personal support — all in one thoughtful learning ecosystem.",
    type: "website",
    url: "https://themindpoint.org/courses",
  },
  twitter: {
    card: "summary_large_image",
    title: "Programs - The Mind Point",
    description:
      "Explore psychology learning and support designed around where you are now.",
  },
};

const coursesStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "The Mind Point Psychology Programs",
  description:
    "Psychology education, certificate programs, diplomas, supervised learning, therapy sessions, and professional development programs",
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
        provider: { "@type": "Organization", name: "The Mind Point" },
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
        provider: { "@type": "Organization", name: "The Mind Point" },
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
        provider: { "@type": "Organization", name: "The Mind Point" },
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
        provider: { "@type": "Organization", name: "The Mind Point" },
      },
    },
    {
      "@type": "ListItem",
      position: 5,
      item: {
        "@type": "Course",
        name: "Masterclasses",
        description:
          "Focused learning experiences across psychology and mental health topics",
        url: "https://themindpoint.org/courses/masterclass",
        provider: { "@type": "Organization", name: "The Mind Point" },
      },
    },
  ],
};

async function getAllCourses() {
  try {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.warn(
        "NEXT_PUBLIC_CONVEX_URL not available, returning empty courses array",
      );
      return [];
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    const courses = await convex.query(api.courses.listCourses, {});
    return courses || [];
  } catch (error) {
    console.warn("Failed to fetch courses:", error);
    return [];
  }
}

export default async function CoursesPage() {
  const courses = await getAllCourses();

  return (
    <div className="tmp-programs-page">
      <Script
        id="courses-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(coursesStructuredData),
        }}
      />
      <CoursesHero />
      <section className="brand-section-tint border-t border-primary/5 py-14 sm:py-18 lg:py-20">
        <div className="container">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="brand-kicker">Browse all programs</span>
            <h2 className="font-display text-foreground mt-4 text-4xl font-medium sm:text-5xl">
              Compare the details. Choose at your pace.
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-8">
              Dates, formats, pricing, and enrolment options remain clear and practical — with the new TMP visual language around them.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="py-16 text-center text-muted-foreground">
                Loading programs...
              </div>
            }
          >
            <CoursesClient coursesData={courses} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
