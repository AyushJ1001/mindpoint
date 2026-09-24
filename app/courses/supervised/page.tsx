import { openGraphImage } from "@/lib/seo";
import CourseTypePage from "@/components/CourseTypePage";
import SupervisedFAQSection from "@/components/therapy/supervised-faq-section";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Clinical Supervision for Therapists - The Mind Point",
  description:
    "Supervision for students and early-career therapists who want honest feedback on real work. Working clinicians, specific feedback, and support that continues after the program.",
  keywords:
    "supervised courses, psychology supervision, mental health training, expert guidance, personalized learning",
  openGraph: {
    images: [openGraphImage],
    title: "Clinical Supervision for Therapists - The Mind Point",
    description:
      "Honest feedback on real clinical work from supervisors who practise today.",
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
      convex.query(api.courses.listCoursesByType, { type: "supervised" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "supervised",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch supervised courses:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function SupervisedCoursesPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <>
      <CourseTypePage
        type="supervised"
        coursesData={courses}
        bogoCourses={bogoCourses}
      />
      <SupervisedFAQSection />
    </>
  );
}
