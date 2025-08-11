import CoursesClient from "@/components/CoursesClient";

export const metadata = {
  title: "Courses - The Mind Point",
  description:
    "Explore our comprehensive range of mental health education courses including certificate programs, diplomas, workshops, and professional development training.",
  keywords:
    "mental health courses, psychology courses, certificate programs, diploma courses, professional development, online learning",
  openGraph: {
    title: "Courses - The Mind Point",
    description:
      "Explore our comprehensive range of mental health education courses.",
    type: "website",
  },
};

export default function CoursesPage() {
  return <CoursesClient />;
}
