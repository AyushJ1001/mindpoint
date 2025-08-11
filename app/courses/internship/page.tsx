import CourseTypePage from "@/components/CourseTypePage";

export const metadata = {
  title: "Internship Programs - The Mind Point",
  description:
    "Gain practical experience through our supervised internship programs in psychology and mental health. Apply theory to practice with hands-on training.",
  keywords:
    "internship programs, psychology internships, mental health training, practical experience, supervised learning",
  openGraph: {
    title: "Internship Programs - The Mind Point",
    description:
      "Gain practical experience through our supervised internship programs.",
    type: "website",
  },
};

export default function InternshipCoursesPage() {
  return (
    <CourseTypePage
      courseType="internship"
      title="Training-based Internships"
      description="Launch your psychology career with our hands-on training-based internships. Designed for aspiring mental health professionals, our internships provide real-world experience under the guidance of seasoned mentors. With personalized feedback and structured learning paths, you’ll build confidence and a competitive edge. Join our community of learners and take the first step toward a fulfilling career in psychology!"
      iconName="Users"
    />
  );
}
