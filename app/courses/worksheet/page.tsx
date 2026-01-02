import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

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
      title="Worksheets"
      description="Access our collection of comprehensive worksheets and downloadable resources designed to enhance your learning experience. Each worksheet is carefully crafted by our expert faculty to provide practical tools, exercises, and insights that complement your psychology and mental health education. Download instantly after purchase and use these resources at your own pace to reinforce key concepts and apply what you've learned."
      iconName="FileText"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
