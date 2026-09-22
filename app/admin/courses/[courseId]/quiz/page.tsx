import Link from "next/link";
import QuizManager from "@/components/admin/QuizManager";

export const metadata = {
  title: "Quiz - MindPoint Admin",
};

export default async function AdminCourseQuizPage({
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
          Course quiz
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Optional end-of-course quiz. When published with questions, learners
          must pass it (alongside finishing every lesson) to earn their
          certificate. Correct answers are graded server-side and never exposed
          to learners.
        </p>
      </div>
      <QuizManager courseId={courseId} />
    </div>
  );
}
