import type { Metadata } from "next";
import { CertificateVerification } from "@/components/lms/CertificateVerification";
import "../certificate.css";

export const metadata: Metadata = {
  title: "Verify Certificate | The Mind Point",
  description:
    "Verify a course-completion Certificate issued by The Mind Point.",
  robots: { index: false, follow: false },
};

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <CertificateVerification code={decodeURIComponent(code)} />;
}
