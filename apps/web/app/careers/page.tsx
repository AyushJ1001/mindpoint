import type { Metadata } from "next";
import CareersClient from "@/components/careers-client";

export const metadata: Metadata = {
  title: "Careers - The Mind Point | Join Our Mental Health Mission",
  description:
    "Join The Mind Point team and help us empower minds through mental health education. Explore career opportunities and apply with your resume.",
  keywords:
    "careers, jobs, mental health careers, psychology jobs, therapy careers, education jobs",
  openGraph: {
    title: "Careers - The Mind Point | Join Our Mental Health Mission",
    description:
      "Join The Mind Point team and help us empower minds through mental health education.",
    type: "website",
  },
};

export default function CareersPage() {
  return <CareersClient />;
}
