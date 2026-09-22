import type { Metadata } from "next";
import { LmsPreview } from "@/components/lms/LmsPreview";
import "./preview.css";

export const metadata: Metadata = {
  title: "LMS Preview | The Mind Point",
  description: "Interactive preview of The Mind Point learning workspace.",
  robots: { index: false, follow: false },
};

type LmsPreviewPageProps = {
  searchParams: Promise<{ role?: string }>;
};

export default async function LmsPreviewPage({
  searchParams,
}: LmsPreviewPageProps) {
  const { role } = await searchParams;
  const initialRole =
    role === "faculty" || role === "administrator" ? role : "student";

  return (
    <div className="lms-preview-page">
      <LmsPreview initialRole={initialRole} />
    </div>
  );
}
