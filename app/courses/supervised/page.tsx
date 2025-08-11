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
        description="Gain practical therapy experience with our supervised therapy sessions, tailored for psychology students and early-career professionals. Under the guidance of licensed therapists, you'll observe and participate in real therapy scenarios, practicing techniques like CBT, mindfulness, and family therapy. Each session includes pre-briefing, live supervision, and post-session feedback to refine your skills. Sessions are conducted in a safe, confidential environment, ensuring ethical practice. Available in small groups or one-on-one formats, these sessions are your gateway to becoming a confident, competent therapist. Elevate your practice with expert supervision!"
        iconName="Eye"
      />
      <SupervisedFAQSection />
    </>
  );
}
