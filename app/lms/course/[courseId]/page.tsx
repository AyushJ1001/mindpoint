import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseResources } from "@/components/lms/CourseResources";
import type { Id } from "@/lib/backend/data-model";

// Auth-gated course resources; render per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Course materials | The Mind Point",
  description: "Your notes, recordings and certificate.",
  robots: { index: false, follow: false },
};

export default async function LmsCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  if (!courseId.startsWith("k")) notFound();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <CourseResources courseId={courseId as Id<"courses">} />
    </div>
  );
}
