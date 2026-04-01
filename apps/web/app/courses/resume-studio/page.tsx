import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@mindpoint/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Resume Studio - The Mind Point",
  description:
    "Build your professional resume and career development skills with our specialized resume studio program. Stand out in the mental health field.",
  keywords:
    "resume studio, career development, professional resume, mental health careers, job preparation",
  openGraph: {
    title: "Resume Studio - The Mind Point",
    description:
      "Build your professional resume and career development skills.",
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
      convex.query(api.courses.listCoursesByType, { type: "resume-studio" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "resume-studio",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch resume-studio courses:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function ResumeStudioCoursesPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <CourseTypePage
      type="resume-studio"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
