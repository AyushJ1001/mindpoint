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
        url: "https://themindpoint.org/courses/internship",
        provider: { "@type": "Organization", name: "The Mind Point" },
      },
    },
  ],
};

async function getAllCourses() {
  try {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) return [];
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
    <div className="tmp-programs-page ss-page">
      <Script
        id="courses-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesStructuredData) }}
      />
      <CoursesHero />

      <section className="ss-section">
        <div className="ss-wrap">
          <p className="ss-kicker">the full catalogue</p>
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end lg:gap-16">
            <h2 className="ss-heading-lg">Every programme, in one place.</h2>
            <p className="ss-lead">
              Compare dates, formats, prices and enrolment options without losing
              the bigger picture. Choose the programme that fits your stage now.
            </p>
          </div>

          <div className="mt-12 border-t border-[#163f3d]/20 pt-10">
            <Suspense
              fallback={
                <div className="py-16 text-center text-[#65736f]">
                  Loading programmes…
                </div>
              }
            >
              <CoursesClient coursesData={courses} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
