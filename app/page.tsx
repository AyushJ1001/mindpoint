import HomeClient from "@/components/HomeClient";

export const metadata = {
  title: "The Mind Point - Mental Health Education & Professional Development",
  description:
    "Empowering minds through comprehensive mental health education and professional development. Learn with structured programs, live workshops, and science-backed resources.",
  keywords:
    "mental health, psychology, education, therapy, counseling, professional development, online courses",
  openGraph: {
    title:
      "The Mind Point - Mental Health Education & Professional Development",
    description:
      "Empowering minds through comprehensive mental health education and professional development.",
    type: "website",
  },
};

export default function Home() {
  return <HomeClient />;
}
