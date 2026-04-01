import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@mindpoint/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Pre-recorded Courses - The Mind Point",
  description:
    "Learn at your own pace with our pre-recorded courses in psychology and mental health. Flexible, self-paced learning with comprehensive content.",
  keywords:
    "pre-recorded courses, self-paced learning, psychology courses, mental health education, online learning",
  openGraph: {
    title: "Pre-recorded Courses - The Mind Point",
    description: "Learn at your own pace with our pre-recorded courses.",
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
      convex.query(api.courses.listCoursesByType, { type: "pre-recorded" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "pre-recorded",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch pre-recorded courses:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function PreRecordedCoursesPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <CourseTypePage
      type="pre-recorded"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
