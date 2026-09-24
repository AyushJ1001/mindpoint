import { openGraphImage } from "@/lib/seo";
import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Diploma Programs in Psychology - The Mind Point",
  description:
    "Advanced, applied diploma programs in psychology and mental health. Go beyond the surface with complex case work, personalised mentorship and a qualification that signals depth.",
  keywords:
    "diploma courses, psychology diplomas, mental health education, advanced training, professional development",
  openGraph: {
    images: [openGraphImage],
    title: "Diploma Programs in Psychology - The Mind Point",
    description:
      "Advanced, applied diploma programs with complex case work, mentorship and a qualification that signals depth.",
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
      convex.query(api.courses.listCoursesByType, { type: "diploma" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "diploma",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch diploma courses:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function DiplomaCoursesPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <CourseTypePage
      type="diploma"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
