import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@mindpoint/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Certificate Courses - The Mind Point",
  description:
    "Discover our expertly designed certificate courses in psychology and mental health. Learn from experienced professionals with evidence-based theory and practical exercises.",
  keywords:
    "certificate courses, psychology courses, mental health education, professional development, online learning",
  openGraph: {
    title: "Certificate Courses - The Mind Point",
    description:
      "Discover our expertly designed certificate courses in psychology and mental health.",
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
