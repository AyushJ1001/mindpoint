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
import {
  buildHomeCourses,
  type HomeCourses,
} from "@/components/landing/home-courses";

export const revalidate = 3600; // Revalidate every hour

const description =
  "Live online psychology certificate courses starting January 2027: CBT, REBT and CBMT; Personality Disorders; and Inner Child Healing & Therapy. Eight weeks each, six weeks of structured learning then two weeks of practical training, ₹3,499 per course. Self-paced introductions from ₹999.";

export const metadata = {
  title: "The Mind Point — live psychology certificate courses, January 2027",
  description,
  keywords:
    "psychology courses India, CBT course, REBT, personality disorders course, inner child healing, counselling psychology, online psychology certificate",
  openGraph: {
    images: [openGraphImage],
    title: "The Mind Point — January 2027 psychology certificate courses",
    description:
      "Three live online certificate courses start in January 2027: six weeks of structured learning, then two weeks of practical training. ₹3,499 each.",
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

async function getHomeCourses(): Promise<HomeCourses> {
  try {
    const { convexUrl } = readPublicEnv();

    // Skip data fetching during build if CONVEX_URL is not available
    if (!convexUrl) {
      console.warn(
        "NEXT_PUBLIC_CONVEX_URL not available, rendering the homepage without course data",
      );
      return buildHomeCourses([]);
    }

    const convex = new ConvexHttpClient(convexUrl);
    const allCourses = await convex.query(api.courses.listCourses, {
      count: undefined,
    });
    return buildHomeCourses(allCourses ?? []);
  } catch (error) {
    console.warn("Failed to fetch homepage courses:", error);
    return buildHomeCourses([]);
  }
}

export default async function Home() {
  let canAccessAdmin = false;
  const courses = await getHomeCourses();

  if (isClerkServerConfigured()) {
    const { userId, sessionClaims, getToken } = await auth();
    const sessionEmail = await resolveAuthEmail(sessionClaims);

    if (!userId && !sessionEmail) {
      return (
        <>
          <HomeFaqSchema />
          <CoastalHome canAccessAdmin={canAccessAdmin} courses={courses} />
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
      <CoastalHome canAccessAdmin={canAccessAdmin} courses={courses} />
    </>
  );
}
