import type { Metadata } from "next";
import { StudentLmsApp } from "@/components/lms/StudentLmsApp";
import "./lms.css";

export const metadata: Metadata = {
  title: "My Learning | The Mind Point",
  description: "Your calm, accountable learning workspace at The Mind Point.",
  robots: { index: false, follow: false },
};

export default function LmsPage() {
  return <StudentLmsApp />;
}
