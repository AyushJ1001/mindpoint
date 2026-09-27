import { openGraphImage } from "@/lib/seo";
import { TherapyPage } from "@/components/therapy/TherapyPage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";
import Image from "next/image";

export const revalidate = 1800; // 30 min ISR

export const metadata = {
  title: "Online Therapy & Counselling - The Mind Point",
  description:
    "One-to-one online therapy with licensed professionals — confidential, unhurried, and shaped around you. No diagnosis required. Just a space that is yours.",
  keywords:
    "online therapy india, online counselling, therapy for teens, couples therapy, women's mental health, premarital counselling",
  openGraph: {
    images: [openGraphImage],
    title: "Online Therapy & Counselling - The Mind Point",
    description:
      "Confidential, online therapy scheduled around your life. No diagnosis required.",
    type: "website",
  },
};

async function getCourseData() {
  try {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      return { courses: [] };
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    const coursesData = await convex.query(api.courses.listCoursesByType, {
      type: "therapy",
    });

    return { courses: coursesData?.courses ?? [] };
  } catch (error) {
    console.warn("Failed to fetch therapy offerings:", error);
    return { courses: [] };
  }
}

export default async function TherapyCoursesPage() {
  const { courses } = await getCourseData();

  return (
    <div className="relative">
      {/* Subtle therapy backdrop – visible only at the top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] overflow-hidden">
        <Image
          src="/illustrations/therapy.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.06] mix-blend-multiply dark:opacity-[0.04] dark:mix-blend-screen"
          sizes="100vw"
        />
        <div className="to-background absolute inset-0 bg-gradient-to-b from-transparent via-transparent" />
      </div>

      <TherapyPage courses={courses} />
    </div>
  );
}
