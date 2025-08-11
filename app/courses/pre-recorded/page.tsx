import CourseTypePage from "@/components/CourseTypePage";

export const metadata = {
  title: "Pre-recorded Courses - The Mind Point",
  description:
    "Learn at your own pace with our pre-recorded courses in psychology and mental health. Flexible, self-paced learning with comprehensive content.",
  keywords:
    "pre-recorded courses, self-paced learning, psychology courses, mental health education, online learning",
  openGraph: {
    title: "Pre-recorded Courses - The Mind Point",
    description: "Learn at your own pace with our pre-recorded courses.",
    type: "website",
  },
};

export default function PreRecordedCoursesPage() {
  return (
    <CourseTypePage
      courseType="pre-recorded"
      title="Pre-recorded Courses"
      description="Learn psychology anytime, anywhere with our pre-recorded courses. Perfect for busy schedules, these self-paced courses deliver high-quality content through engaging video lectures, downloadable resources, and interactive quizzes. Explore diverse topics like Child Psychology, Neuropsychology, and Relationship Therapy, taught by our expert faculty. Each course is designed for clarity and retention, with bite-sized lessons (5–15 minutes) and practical tools you can apply immediately. Take control of your learning and unlock your potential with The Mind Point!"
      iconName="PlayCircle"
    />
  );
}
