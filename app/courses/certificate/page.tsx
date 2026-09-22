import { openGraphImage } from "@/lib/seo";
import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Certificate Courses in Psychology - The Mind Point",
  description:
    "Expert-led, practice-first certificate courses in psychology and mental health. Small cohorts, real exercises, and a verifiable certificate you can put to work.",
  keywords:
    "certificate courses, psychology courses, mental health education, professional development, online learning",
  openGraph: {
    images: [openGraphImage],
    title: "Certificate Courses in Psychology - The Mind Point",
    description:
      "Practice-first certificate courses with small cohorts, real exercises, and a verifiable certificate.",
    type: "website",
  },
};

async function getCourseData() {
  try {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    const [coursesData, bogoCourses] = await Promise.all([
      convex.query(api.courses.listCoursesByType, { type: "certificate" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "certificate",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch certificate courses:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function CertificateCoursesPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <CourseTypePage
      type="certificate"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
