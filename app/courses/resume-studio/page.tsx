import CourseTypePage from "@/components/CourseTypePage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

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
      title="TMP Resume Studio"
      description="Stand out in the competitive psychology field with our Resume Studio. Our expert team helps you craft a polished, professional resume that highlights your skills, certifications, and experience. Whether you're applying for internships, jobs, or graduate programs, we tailor your resume to showcase your unique strengths, incorporating keywords that appeal to psychology recruiters. Receive one-on-one consultations, personalized feedback, and a professionally designed resume template. Build a resume that opens doors and propels your career forward with The Mind Point!"
      iconName="FileText"
      coursesData={courses}
      bogoCourses={bogoCourses}
    />
  );
}
