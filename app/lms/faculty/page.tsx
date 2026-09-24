import type { Metadata } from "next";
import { FacultyLmsApp } from "@/components/lms/FacultyLmsApp";
import "../lms.css";
import "./faculty.css";

// Auth-gated workspace; render per request rather than as a static page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Faculty Review | The Mind Point",
  description: "Permission-scoped Faculty review workspace for The Mind Point.",
  robots: { index: false, follow: false },
};

export default function FacultyLmsPage() {
  return <FacultyLmsApp />;
}
