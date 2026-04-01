import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@mindpoint/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Masterclass Programs - The Mind Point",
  description:
    "Join our exclusive masterclass programs led by industry experts in psychology and mental health. Intensive learning experiences for advanced professionals.",
  keywords:
    "masterclass programs, psychology masterclasses, expert-led training, intensive learning, mental health education",
  openGraph: {
    title: "Masterclass Programs - The Mind Point",
    description:
      "Join our exclusive masterclass programs led by industry experts.",
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
      convex.query(api.courses.listCoursesByType, { type: "masterclass" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "masterclass",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch masterclass courses:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function MasterclassCoursesPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <CourseTypePage
      type="masterclass"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
