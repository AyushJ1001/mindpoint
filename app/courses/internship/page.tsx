import { openGraphImage } from "@/lib/seo";
import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Internship Programs in Psychology - The Mind Point",
  description:
    "Structured psychology internships with real case exposure, clear milestones and a mentor invested in your progress. Turn what you know into what you can do.",
  keywords:
    "internship programs, psychology internships, mental health training, practical experience, supervised learning",
  openGraph: {
    images: [openGraphImage],
    title: "Internship Programs in Psychology - The Mind Point",
    description:
      "Real case exposure, clear milestones and a mentor invested in your progress.",
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
      convex.query(api.courses.listCoursesByType, { type: "internship" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "internship",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch internship courses:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function InternshipCoursesPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <CourseTypePage
      type="internship"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
