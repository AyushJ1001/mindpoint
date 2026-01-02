import CourseTypePage from "@/components/CourseTypePage";
import SupervisedFAQSection from "@/components/therapy/supervised-faq-section";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Supervised Courses - The Mind Point",
  description:
    "Learn under expert supervision with our supervised courses in psychology and mental health. Get personalized guidance and feedback from professionals.",
  keywords:
    "supervised courses, psychology supervision, mental health training, expert guidance, personalized learning",
  openGraph: {
    title: "Supervised Courses - The Mind Point",
    description: "Learn under expert supervision with personalized guidance.",
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
        title="TMP Supervised Sessions"
        description="At The Mind Point, our supervised therapy sessions are designed to support psychology students and professionals in developing their therapy skills with expert guidance. Whether you're just starting out or seeking to enhance your practice, our structured supervision packages help you build confidence and competence in a safe, supportive environment."
        iconName="Eye"
        coursesData={courses}
        bogoCourses={bogoCourses}
      />
      <SupervisedFAQSection />
    </>
  );
}
