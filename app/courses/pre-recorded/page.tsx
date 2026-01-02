import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Pre-recorded Courses - The Mind Point",
  description:
    "Learn at your own pace with our pre-recorded courses in psychology and mental health. Flexible, self-paced learning with comprehensive content.",
  keywords:
    "pre-recorded courses, self-paced learning, psychology courses, mental health education, online learning",
  openGraph: {
    title: "Pre-recorded Courses - The Mind Point",
    description: "Learn at your own pace with our pre-recorded courses.",
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
      convex.query(api.courses.listCoursesByType, { type: "pre-recorded" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "pre-recorded",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch pre-recorded courses:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function PreRecordedCoursesPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <CourseTypePage
      title="Pre-recorded Courses"
      description="Learn psychology anytime, anywhere with our pre-recorded courses. Perfect for busy schedules, these self-paced courses deliver high-quality content through engaging video lectures, downloadable resources, and interactive quizzes. Explore diverse topics like Child Psychology, Neuropsychology, and Relationship Therapy, taught by our expert faculty. Each course is designed for clarity and retention, with bite-sized lessons (5–15 minutes) and practical tools you can apply immediately. Take control of your learning and unlock your potential with The Mind Point!"
      iconName="PlayCircle"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
