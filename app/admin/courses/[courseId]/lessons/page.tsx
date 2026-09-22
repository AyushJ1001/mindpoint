import Link from "next/link";
import LessonManager from "@/components/admin/LessonManager";

export const metadata = {
  title: "Lessons - MindPoint Admin",
};

export default async function AdminCourseLessonsPage({
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
          Course lessons
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Author the lessons enrolled learners see in their learning dashboard.
          Lessons are grouped by module and revealed only to signed-in, enrolled
          learners.
        </p>
      </div>
      <LessonManager courseId={courseId} />
    </div>
  );
}
