import { openGraphImage } from "@/lib/seo";
import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Resume Studio for Psychology Careers - The Mind Point",
  description:
    "A psychology-specific, ATS-friendly CV built around your real experience — with personal feedback and career positioning, not a fill-in-the-blank template.",
  keywords:
    "resume studio, career development, professional resume, mental health careers, job preparation",
  openGraph: {
    images: [openGraphImage],
    title: "Resume Studio for Psychology Careers - The Mind Point",
    description:
      "A psychology-specific, ATS-friendly CV with personal feedback and career positioning.",
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
