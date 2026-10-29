import { openGraphImage } from "@/lib/seo";
import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";
import type { PublicCourse } from "@/lib/backend";
import CoursesClient from "@/components/CoursesClient";
import CoursesHero from "@/components/CoursesHero";
import Script from "next/script";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ctaVariants } from "@/components/coastal/cta";
import { ScrollReveal } from "@/components/ScrollReveal";

export const revalidate = 1800; // Revalidate every 30 minutes

export const metadata: Metadata = {
  title: "All Courses | The Mind Point",
  description:
    "Explore live certificate courses, internships, self-paced intro courses, therapy, supervision and worksheets in psychology and mental health. Practice-first and built to fit real life.",
  keywords:
    "mental health courses, psychology courses, certificate programs, diploma courses, therapy sessions, counseling courses, professional development, online learning",
  openGraph: {
    images: [openGraphImage],
    title: "All Courses | The Mind Point",
    description:
      "Live certificate courses, internships, self-paced intro courses and therapy — practice-first and built to fit real life.",
    type: "website",
    url: "https://www.themindpoint.org/courses",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Courses | The Mind Point",
    description:
      "Live certificate courses, internships, self-paced intro courses and therapy — practice-first and built to fit real life.",
  },
};

// Catalogue sections for structured data. A section is listed only while it has
// a course on sale; therapy always renders its own page.
const CATALOGUE_SECTIONS: {
  type: PublicCourse["type"];
  name: string;
  description: string;
  path: string;
}[] = [
  {
    type: "certificate",
    name: "Certificate Courses",
    description:
      "Live certificate courses in psychology and mental health: eight weeks, six of structured learning and two of practical training",
    path: "/courses/certificate",
  },
  {
    type: "internship",
    name: "Internship Programs",
    description:
      "Supervised internships with simulated practice and faculty feedback",
    path: "/courses/internship",
  },
  {
    type: "pre-recorded",
    name: "Self-paced Intro Courses",
    description: "Self-paced introductions to areas of psychology",
    path: "/courses/intro",
  },
  {
    type: "therapy",
    name: "Therapy Sessions",
    description:
      "Professional therapy and counseling services for mental wellness",
    path: "/courses/therapy",
  },
  {
    type: "diploma",
    name: "Diploma Programs",
    description: "Diploma courses for in-depth knowledge",
    path: "/courses/diploma",
  },
  {
    type: "masterclass",
    name: "Masterclasses",
    description: "Focused sessions on a single topic",
    path: "/courses/masterclass",
  },
];

function coursesStructuredData(courses: PublicCourse[]) {
  const liveTypes = new Set(courses.map((course) => course.type));
  const sections = CATALOGUE_SECTIONS.filter(
    (section) => section.type === "therapy" || liveTypes.has(section.type),
  );
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Mental Health Education Courses",
    description:
      "Certificate courses, internships, self-paced intro courses and therapy in psychology and mental health",
    url: "https://www.themindpoint.org/courses",
    numberOfItems: sections.length,
    itemListElement: sections.map((section, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: section.name,
        description: section.description,
        url: `https://www.themindpoint.org${section.path}`,
        provider: {
          "@type": "Organization",
          name: "The Mind Point",
        },
      },
    })),
  };
}

async function getAllCourses(): Promise<PublicCourse[]> {
  try {
    // Skip data fetching during build if CONVEX_URL is not available
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
    <>
      <Script
        id="courses-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(coursesStructuredData(courses)),
        }}
      />
      <CoursesHero liveTypes={new Set(courses.map((course) => course.type))} />
      <Suspense fallback={<div>Loading courses...</div>}>
        <CoursesClient coursesData={courses} />
      </Suspense>

      <section className="section-padding pt-0">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="border-border bg-card rounded-3xl border border-dashed px-7 py-12 text-center sm:px-12">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                Not sure which one is right?
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
                Tell us where you are and what you want to do next. We&apos;ll
                point you to the course that fits — no pressure, no hard sell.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className={ctaVariants({ layout: "flex" })}
                >
                  Talk to an advisor
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#catalog" className="calm-link text-sm font-medium">
                  Browse the full catalogue
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
