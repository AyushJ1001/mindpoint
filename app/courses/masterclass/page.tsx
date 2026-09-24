import { openGraphImage } from "@/lib/seo";
import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Masterclasses in Psychology - The Mind Point",
  description:
    "Live, focused masterclasses led by practising experts in psychology and mental health. One topic, real depth, and answers to the questions you actually have.",
  keywords:
    "masterclass programs, psychology masterclasses, expert-led training, intensive learning, mental health education",
  openGraph: {
    images: [openGraphImage],
    title: "Masterclasses in Psychology - The Mind Point",
    description:
      "Live, focused masterclasses led by practising experts. One topic, real depth, real answers.",
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
