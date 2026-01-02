import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Masterclass Programs - The Mind Point",
  description:
    "Join our exclusive masterclass programs led by industry experts in psychology and mental health. Intensive learning experiences for advanced professionals.",
  keywords:
    "masterclass programs, psychology masterclasses, expert-led training, intensive learning, mental health education",
  openGraph: {
    title: "Masterclass Programs - The Mind Point",
    description:
      "Join our exclusive masterclass programs led by industry experts.",
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
      title="MasterClass & Workshops"
      description="Elevate your psychology knowledge with our dynamic workshops and masterclasses, led by industry experts and renowned psychologists. These immersive sessions dive deep into trending topics like mindfulness, trauma-informed care, and leadership psychology. Engage in hands-on activities, live discussions, and Q&A sessions to gain practical insights you can apply immediately. Our workshops and masterclasses offer certificates of participation and networking opportunities. Join our vibrant community and stay ahead in the ever-evolving field of psychology with The Mind Point!"
      iconName="Lightbulb"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
