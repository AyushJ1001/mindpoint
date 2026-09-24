import type { Metadata } from "next";
import { StudentLmsApp } from "@/components/lms/StudentLmsApp";
import "./lms.css";

// Auth-gated workspace; render per request rather than as a static page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Learning | The Mind Point",
  description: "Your calm, accountable learning workspace at The Mind Point.",
  robots: { index: false, follow: false },
};

export default function LmsPage() {
  return <StudentLmsApp />;
}
