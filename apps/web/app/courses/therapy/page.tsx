import CourseTypePage from "@/components/CourseTypePage";
import TherapyFAQSection from "@/components/therapy/therapy-faq-section";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

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
    <>
      <CourseTypePage
        title="Therapy & Counselling Sessions"
        description="Find personalized support with our therapy and counseling sessions, designed to promote mental wellness and personal growth. Our licensed therapists, offer one-on-one sessions tailored to your needs, addressing challenges like anxiety, stress, or relationship issues. Using evidence-based approaches like CBT and positive psychology, we create a safe, non-judgmental space for healing. Sessions are available virtually, with flexible scheduling and affordable rates. Take the first step toward a happier, healthier you with compassionate, professional care at The Mind Point."
        iconName="Heart"
        coursesData={courses}
        bogoCourses={bogoCourses}
      />
      <TherapyFAQSection />
    </>
  );
}
