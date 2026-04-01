import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";
import { api } from "@mindpoint/backend/api";
import { readPublicEnv } from "@mindpoint/config";
import { Suspense } from "react";
import { hasAdminAccess } from "@/lib/admin-access";
import { resolveAuthEmail } from "@/lib/clerk-email";
import { isClerkServerConfigured } from "@/lib/clerk-env";
import HeroSection from "@/components/landing/HeroSection";
import WhoThisIsForSection from "@/components/landing/WhoThisIsForSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CoursePreviewSection from "@/components/landing/CoursePreviewSection";
import FinalCtaSection from "@/components/landing/FinalCtaSection";

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
    const { convexUrl } = readPublicEnv();

    // Skip data fetching during build if CONVEX_URL is not available
    if (!convexUrl) {
      console.warn(
        "NEXT_PUBLIC_CONVEX_URL not available, returning empty courses array",
      );
      return [];
    }

    const convex = new ConvexHttpClient(convexUrl);
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
  let canAccessAdmin = false;
  const upcomingCourses = await getUpcomingCourses();

  if (isClerkServerConfigured()) {
    const { userId, sessionClaims, getToken } = await auth();
    const sessionEmail = await resolveAuthEmail(sessionClaims);

    if (!userId && !sessionEmail) {
      return (
        <>
          <HeroSection canAccessAdmin={canAccessAdmin} />
          <WhoThisIsForSection />
          <TestimonialsSection />
          <Suspense
            fallback={
              <div className="section-padding text-muted-foreground text-center">
                Loading courses...
              </div>
            }
          >
            <CoursePreviewSection upcomingCourses={upcomingCourses} />
          </Suspense>
          <FinalCtaSection />
        </>
      );
    }

    try {
      const convexToken = await getToken({ template: "convex" });
      canAccessAdmin = await hasAdminAccess(userId, sessionEmail, convexToken);
    } catch (error) {
      console.warn("Failed to resolve home-page admin access:", error);
    }
  }

  return (
    <>
      <HeroSection canAccessAdmin={canAccessAdmin} />
      <WhoThisIsForSection />
      <TestimonialsSection />
      <Suspense
        fallback={
          <div className="section-padding text-muted-foreground text-center">
            Loading courses...
          </div>
        }
      >
        <CoursePreviewSection upcomingCourses={upcomingCourses} />
      </Suspense>
      <FinalCtaSection />
    </>
  );
}
