import Link from "next/link";
import CourseProgressTable from "@/components/admin/CourseProgressTable";

export const metadata = {
  title: "Learner progress - MindPoint Admin",
};

export default async function AdminCourseProgressPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/courses/${courseId}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to course
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Learner progress
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Lesson completion, quiz results and issued certificates for everyone
          enrolled in this course. Export to CSV for records.
        </p>
      </div>
      <CourseProgressTable courseId={courseId} />
    </div>
  );
}
