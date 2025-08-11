import CourseTypePage from "@/components/CourseTypePage";

export const metadata = {
  title: "Resume Studio - The Mind Point",
  description:
    "Build your professional resume and career development skills with our specialized resume studio program. Stand out in the mental health field.",
  keywords:
    "resume studio, career development, professional resume, mental health careers, job preparation",
  openGraph: {
    title: "Resume Studio - The Mind Point",
    description:
      "Build your professional resume and career development skills.",
    type: "website",
  },
};

export default function ResumeStudioCoursesPage() {
  return (
    <CourseTypePage
      courseType="resume-studio"
      title="TMP Resume Studio"
      description="Stand out in the competitive psychology field with our Resume Studio. Our expert team helps you craft a polished, professional resume that highlights your skills, certifications, and experience. Whether you’re applying for internships, jobs, or graduate programs, we tailor your resume to showcase your unique strengths, incorporating keywords that appeal to psychology recruiters. Receive one-on-one consultations, personalized feedback, and a professionally designed resume template. Build a resume that opens doors and propels your career forward with The Mind Point!"
      iconName="FileText"
    />
  );
}
