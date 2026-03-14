import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Internship Programs - The Mind Point",
  description:
    "Gain practical experience through our supervised internship programs in psychology and mental health. Apply theory to practice with hands-on training.",
  keywords:
    "internship programs, psychology internships, mental health training, practical experience, supervised learning",
  openGraph: {
    title: "Internship Programs - The Mind Point",
    description:
      "Gain practical experience through our supervised internship programs.",
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
      convex.query(api.courses.listCoursesByType, { type: "internship" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "internship",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch internship courses:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function InternshipCoursesPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <CourseTypePage
      title="Training-based Internships"
      description="Launch your psychology career with our hands-on training-based internships. Designed for aspiring mental health professionals, our internships provide real-world experience under the guidance of seasoned mentors. With personalized feedback and structured learning paths, you'll build confidence and a competitive edge. Join our community of learners and take the first step toward a fulfilling career in psychology!"
      iconName="Users"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
