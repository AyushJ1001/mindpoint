import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import HomeClient from "@/components/HomeClient";
import HomeHero from "@/components/HomeHero";
import { Suspense } from "react";

// Remove force-static as we need to fetch dynamic data
export const revalidate = 3600; // Revalidate every hour

export const metadata = {
  title: "The Mind Point - Mental Health Education & Professional Development",
  description:
    "Empowering minds through comprehensive mental health education and professional development. Learn with structured programs, live workshops, and science-backed resources.",
  keywords:
    "mental health, psychology, education, therapy, counseling, professional development, online courses",
  openGraph: {
    title:
      "The Mind Point - Mental Health Education & Professional Development",
    description:
      "Empowering minds through comprehensive mental health education and professional development.",
    type: "website",
  },
  metadataBase: new URL("https://themindpoint.org"),
  alternates: {
    canonical: "/",
  },
};

async function getUpcomingCourses() {
  try {
    // Skip data fetching during build if CONVEX_URL is not available
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.warn(
        "NEXT_PUBLIC_CONVEX_URL not available, returning empty courses array",
      );
      return [];
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    const allCourses = await convex.query(api.courses.listCourses, {
      count: undefined,
    });

    const upcomingCourses = allCourses
      ?.filter((course) => {
        if (!course.startDate || course.startDate.trim() === "") return false;
        if (!course.type) return false;
        if (course.type === "pre-recorded") return false;

        const startDate = new Date(course.startDate);
        const now = new Date();
        return startDate > now;
      })
      ?.sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      )
      .slice(0, 4);

    return upcomingCourses || [];
  } catch (error) {
    console.warn("Failed to fetch upcoming courses:", error);
    return [];
  }
}

export default async function Home() {
  const upcomingCourses = await getUpcomingCourses();

  return (
    <>
      <HomeHero />
      <Suspense fallback={<div>Loading courses...</div>}>
        <HomeClient upcomingCourses={upcomingCourses} />
      </Suspense>
    </>
  );
}
