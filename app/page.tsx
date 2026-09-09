import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/lib/backend/api";
import { readPublicEnv } from "@/lib/config";
import { Suspense } from "react";
import { hasAdminAccess } from "@/lib/admin-access";
import { resolveAuthEmail } from "@/lib/clerk-email";
import { isClerkServerConfigured } from "@/lib/clerk-env";
import HeroSection from "@/components/landing/HeroSection";
import TwoPathsSection from "@/components/landing/TwoPathsSection";
import WhoThisIsForSection from "@/components/landing/WhoThisIsForSection";
import WhatWeOfferSection from "@/components/landing/WhatWeOfferSection";
import FeaturedEntrySection from "@/components/landing/FeaturedEntrySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CoursePreviewSection from "@/components/landing/CoursePreviewSection";
import FinalCtaSection from "@/components/landing/FinalCtaSection";

export const revalidate = 3600;

export const metadata = {
  title: "The Mind Point - Learn. Grow. Heal. Belong.",
  description:
    "Psychology education, practical training and supportive learning designed for students, aspiring mental health professionals and lifelong learners.",
  keywords:
    "mental health, psychology, education, therapy, counseling, professional development, online courses",
  openGraph: {
    title: "The Mind Point - Learn. Grow. Heal. Belong.",
    description:
      "A thoughtful space for psychology education, practical training, healing and professional growth.",
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

function HomeSections({ upcomingCourses }: { upcomingCourses: Awaited<ReturnType<typeof getUpcomingCourses>> }) {
  return (
    <>
      <HeroSection canAccessAdmin={false} />
      <Suspense
        fallback={
          <div className="section-padding text-muted-foreground text-center">
            Loading programs...
          </div>
        }
      >
        <CoursePreviewSection upcomingCourses={upcomingCourses} />
      </Suspense>
      <TwoPathsSection />
      <WhoThisIsForSection />
      <WhatWeOfferSection />
      <FeaturedEntrySection />
      <TestimonialsSection />
      <FinalCtaSection />
    </>
  );
}

export default async function Home() {
  let canAccessAdmin = false;
  const upcomingCourses = await getUpcomingCourses();

  if (isClerkServerConfigured()) {
    const { userId, sessionClaims, getToken } = await auth();
    const sessionEmail = await resolveAuthEmail(sessionClaims);

    if (userId || sessionEmail) {
      try {
        const convexToken = await getToken({ template: "convex" });
        canAccessAdmin = await hasAdminAccess(userId, sessionEmail, convexToken);
      } catch (error) {
        console.warn("Failed to resolve home-page admin access:", error);
      }
    }
  }

  return (
    <>
      <HeroSection canAccessAdmin={canAccessAdmin} />
      <Suspense
        fallback={
          <div className="section-padding text-muted-foreground text-center">
            Loading programs...
          </div>
        }
      >
        <CoursePreviewSection upcomingCourses={upcomingCourses} />
      </Suspense>
      <TwoPathsSection />
      <WhoThisIsForSection />
      <WhatWeOfferSection />
      <FeaturedEntrySection />
      <TestimonialsSection />
      <FinalCtaSection />
    </>
  );
}
