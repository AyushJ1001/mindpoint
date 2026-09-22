import { openGraphImage } from "@/lib/seo";
import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Psychology Worksheets & Resources - The Mind Point",
  description:
    "Evidence-based, professionally designed worksheets for therapists and clients. Download, print and put them to work in the very next session.",
  keywords:
    "worksheets, psychology worksheets, mental health resources, downloadable PDFs, learning materials",
  openGraph: {
    images: [openGraphImage],
    title: "Psychology Worksheets & Resources - The Mind Point",
    description:
      "Evidence-based worksheets you can download and use in the very next session.",
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
