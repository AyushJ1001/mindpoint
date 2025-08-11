import CourseTypePage from "@/components/CourseTypePage";

export const metadata = {
  title: "Certificate Courses - The Mind Point",
  description:
    "Discover our expertly designed certificate courses in psychology and mental health. Learn from experienced professionals with evidence-based theory and practical exercises.",
  keywords:
    "certificate courses, psychology courses, mental health education, professional development, online learning",
  openGraph: {
    title: "Certificate Courses - The Mind Point",
    description:
      "Discover our expertly designed certificate courses in psychology and mental health.",
    type: "website",
  },
};

export default function CertificateCoursesPage() {
  return (
    <CourseTypePage
      courseType="certificate"
      title="Certificate Courses"
      description="Discover our expertly designed certificate courses, crafted to deepen your understanding of psychology and advance your career. Led by experienced professionals, our courses cover a variety of topics. Each course blends evidence-based theory with practical exercises, ensuring you gain actionable skills. Whether you're a beginner or a seasoned professional, our flexible, affordable courses empower you to master psychology at your own pace. Start your journey to expertise today!"
      iconName="Award"
    />
  );
}
