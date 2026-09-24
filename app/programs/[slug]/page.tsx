import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";

import { CoursePage } from "@/components/course-page/course-page";
import { api } from "@/lib/backend/api";
import type { PublicCourse } from "@/lib/backend";
import { courseSlugs, getCourseBySlug } from "@/lib/course-content";
import { attachOperationalData } from "@/lib/course-content/operational";

type Props = { params: Promise<{ slug: string }> };

// Prices, cohort dates and seats come from the Convex catalogue. Re-render at
// least every 10 minutes so backend edits appear without a redeploy.
export const revalidate = 600;

export function generateStaticParams() {
  return courseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Programme not found - The Mind Point" };

  return {
    title: `${course.title} - The Mind Point`,
    description: course.tagline,
    alternates: { canonical: `/programs/${course.slug}` },
    openGraph: {
      title: `${course.title} - The Mind Point`,
      description: course.tagline,
      type: "website",
      url: `https://www.themindpoint.org/programs/${course.slug}`,
    },
  };
}

async function getCatalogue(): Promise<PublicCourse[]> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return [];
  try {
    const convex = new ConvexHttpClient(convexUrl);
    const courses = await convex.query(api.courses.listCourses, {});
    return courses ?? [];
  } catch (error) {
    console.warn("Failed to fetch the programmes catalogue:", error);
    return [];
  }
}

export default async function ProgrammePage({ params }: Props) {
  const { slug } = await params;
  const base = getCourseBySlug(slug);
  if (!base) notFound();

  const catalogue = base.layout === "brief" ? await getCatalogue() : [];
  const course = attachOperationalData(base, catalogue);

  return <CoursePage course={course} />;
}
