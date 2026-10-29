import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";

import { CoursePage } from "@/components/course-page/course-page";
import { PremiumCoursePage } from "@/components/course-page/premium-course-page";
import { api } from "@/lib/backend/api";
import type { PublicCourse } from "@/lib/backend";
import { getCourseBySlug } from "@/lib/course-content";
import { attachOperationalData } from "@/lib/course-content/operational";

type Props = { params: Promise<{ slug: string }> };

// Prices, cohort dates and seats come from the Convex catalogue. Re-render at
// least every 10 minutes so backend edits appear without a redeploy.
export const revalidate = 600;

/**
 * Programme pages are rendered on demand. Pre-generating every slug meant a
 * draft course was baked into a cached 404 at build time and stayed 404 after
 * publication until the next deploy. Rendering on demand with the revalidate
 * window below lets a course appear as soon as it is on sale.
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Programme not found | The Mind Point" };

  return {
    title: `${course.title} | The Mind Point`,
    description: course.tagline,
    alternates: { canonical: `/programs/${course.slug}` },
    openGraph: {
      title: `${course.title} | The Mind Point`,
      description: course.tagline,
      type: "website",
      url: `https://www.themindpoint.org/programs/${course.slug}`,
    },
  };
}

async function getCatalogue(): Promise<PublicCourse[] | null> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;
  try {
    const convex = new ConvexHttpClient(convexUrl);
    const courses = await convex.query(api.courses.listCourses, {});
    return courses ?? [];
  } catch (error) {
    console.warn("Failed to fetch the programmes catalogue:", error);
    // null means "we could not check", not "nothing is on sale".
    return null;
  }
}

export default async function ProgrammePage({ params }: Props) {
  const { slug } = await params;
  const base = getCourseBySlug(slug);
  if (!base) notFound();

  const catalogue = base.layout === "brief" ? await getCatalogue() : [];
  const catalogueChecked = catalogue !== null;
  const catalogueRows = catalogue ?? [];
  const course = attachOperationalData(base, catalogueRows);

  // The three January certificates share the refined template; their content
  // stays course-specific.
  const REFINED: Record<string, string> = {
    "cbt-rebt-cbmt": "CCCBT",
    "personality-disorders": "CCPD",
    "inner-child-healing": "CCICH",
    "ptsd-complex-trauma": "CCPTSD",
  };
  const refinedCode = REFINED[base.slug];
  if (refinedCode) {
    const catalogueRow = catalogueRows.find((row) => row.code === refinedCode);
    // Only hide the page when we actually checked and the course is not on
    // sale; a catalogue outage must not 404 live programmes.
    if (catalogueChecked && !catalogueRow) notFound();
    return (
      <PremiumCoursePage
        course={course}
        catalogue={catalogueRow}
        courseCode={refinedCode}
      />
    );
  }

  return <CoursePage course={course} />;
}
