import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@mindpoint/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Worksheets - The Mind Point",
  description:
    "Download comprehensive worksheets and resources in psychology and mental health. Practical tools and exercises for your learning journey.",
  keywords:
    "worksheets, psychology worksheets, mental health resources, downloadable PDFs, learning materials",
  openGraph: {
    title: "Worksheets - The Mind Point",
    description:
      "Download comprehensive worksheets and resources for your learning journey.",
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
      convex.query(api.courses.listCoursesByType, { type: "worksheet" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "worksheet",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch worksheets:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function WorksheetPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <CourseTypePage
      type="worksheet"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
