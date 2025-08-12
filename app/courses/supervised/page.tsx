import CourseTypePage from "@/components/CourseTypePage";
import SupervisedFAQSection from "@/components/therapy/supervised-faq-section";

export const metadata = {
  title: "Supervised Courses - The Mind Point",
  description:
    "Learn under expert supervision with our supervised courses in psychology and mental health. Get personalized guidance and feedback from professionals.",
  keywords:
    "supervised courses, psychology supervision, mental health training, expert guidance, personalized learning",
  openGraph: {
    title: "Supervised Courses - The Mind Point",
    description: "Learn under expert supervision with personalized guidance.",
    type: "website",
  },
};

export default function SupervisedCoursesPage() {
  return (
    <>
      <CourseTypePage
        courseType="supervised"
        title="TMP Supervised Sessions"
        description="At The Mind Point, our supervised therapy sessions are designed to support psychology students and professionals in developing their therapy skills with expert guidance. Whether you're just starting out or seeking to enhance your practice, our structured supervision packages help you build confidence and competence in a safe, supportive environment."
        iconName="Eye"
      />
      <SupervisedFAQSection />
    </>
  );
}
