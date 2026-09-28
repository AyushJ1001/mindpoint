import { openGraphImage } from "@/lib/seo";
import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/lib/backend/api";
import { readPublicEnv } from "@/lib/config";
import { hasAdminAccess } from "@/lib/admin-access";
import { resolveAuthEmail } from "@/lib/clerk-email";
import { isClerkServerConfigured } from "@/lib/clerk-env";
import CoastalHome from "@/components/landing/CoastalHome";
import { HOME_FAQ } from "@/lib/home-faq";

export const revalidate = 3600; // Revalidate every hour

export const metadata = {
  title:
    "The Mind Point — psychology courses for students, career changers & therapists in India",
  description:
    "Self-paced psychology intro courses from ₹999, live certificate cohorts from January 2027, supervision and therapy. Structured, evidence-based teaching with honest, publicly verifiable certificates. Rated 4.8 from 248 Google reviews.",
  keywords:
    "mental health, psychology, education, therapy, counseling, professional development, online courses",
  openGraph: {
    images: [openGraphImage],
    title: "The Mind Point — a learning home for psychology",
    description:
      "Self-paced intro courses from ₹999, live certificate cohorts from January 2027, supervision and therapy — with honest, verifiable certificates.",
    type: "website",
  },
  metadataBase: new URL("https://www.themindpoint.org"),
  alternates: {
    canonical: "/",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

function HomeFaqSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
  );
}

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
          <HomeFaqSchema />
          <CoastalHome
            canAccessAdmin={canAccessAdmin}
            upcomingCourses={upcomingCourses}
          />
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
      <HomeFaqSchema />
      <CoastalHome
        canAccessAdmin={canAccessAdmin}
        upcomingCourses={upcomingCourses}
      />
    </>
  );
}
