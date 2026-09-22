import Link from "next/link";
import BatchSessionsManager from "@/components/admin/BatchSessionsManager";

export const metadata = {
  title: "Live sessions - MindPoint Admin",
};

export default async function AdminCourseSessionsPage({
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
          Live sessions
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Set the live class link per batch. Enrolled learners see the schedule
          and join link in their learning dashboard.
        </p>
      </div>
      <BatchSessionsManager courseId={courseId} />
    </div>
  );
}
