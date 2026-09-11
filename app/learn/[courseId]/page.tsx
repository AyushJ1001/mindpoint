import LearningCourse from "@/components/lms/LearningCourse";

export const metadata = {
  title: "My Learning - The Mind Point",
  description: "Access your enrolled TMP course lessons and resources.",
};

export default async function LearnCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <LearningCourse courseId={courseId} />;
}
