import CourseTypePage from "@/components/CourseTypePage";
import TherapyFAQSection from "@/components/therapy/therapy-faq-section";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@mindpoint/backend/api";
import Image from "next/image";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Therapy Programs - The Mind Point",
  description:
    "Explore our therapy programs and mental health services. Professional therapy sessions and training programs for mental health professionals.",
  keywords:
    "therapy programs, mental health therapy, counseling services, therapy training, mental health professionals",
  openGraph: {
    title: "Therapy Programs - The Mind Point",
    description: "Explore our therapy programs and mental health services.",
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
      convex.query(api.courses.listCoursesByType, { type: "therapy" }),
      convex.query(api.courses.getBogoCoursesByType, {
        courseType: "therapy",
      }),
    ]);

    return {
      courses: coursesData || { viewer: null, courses: [] },
      bogoCourses: bogoCourses || [],
    };
  } catch (error) {
    console.warn("Failed to fetch therapy courses:", error);
    return { courses: { viewer: null, courses: [] }, bogoCourses: [] };
  }
}

export default async function TherapyCoursesPage() {
  const { courses, bogoCourses } = await getCourseData();

  return (
    <div className="relative">
      {/* Subtle therapy backdrop – visible only at the top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] overflow-hidden">
        <Image
          src="/illustrations/therapy.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.06] mix-blend-multiply dark:mix-blend-screen dark:opacity-[0.04]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <CourseTypePage
        type="therapy"
        coursesData={courses}
        bogoCourses={bogoCourses}
      />
      <TherapyFAQSection />
    </div>
  );
}
