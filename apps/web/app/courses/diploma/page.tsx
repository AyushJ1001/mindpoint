import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Diploma Courses - The Mind Point",
  description:
    "Explore our comprehensive diploma programs in psychology and mental health. Advanced training for professionals seeking in-depth knowledge and practical skills.",
  keywords:
    "diploma courses, psychology diplomas, mental health education, advanced training, professional development",
  openGraph: {
    title: "Diploma Courses - The Mind Point",
    description:
      "Explore our comprehensive diploma programs in psychology and mental health.",
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
      title="Diploma Programs"
      description="Elevate your psychology expertise with our comprehensive diploma programs, designed for those seeking in-depth knowledge and professional credentials. Each program combines rigorous coursework, hands-on projects, and real-world case studies to prepare you for advanced roles in mental health. With flexible schedules and personalized mentorship, you'll gain practical skills and earn a prestigious diploma. Our programs (6–12 months) are your pathway to a rewarding career in psychology. Enroll today and take charge of your future!"
      iconName="BookOpen"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
