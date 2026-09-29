import type { Metadata } from "next";
import { CertificateVerifyEntry } from "@/components/lms/CertificateVerifyEntry";
import "./certificate.css";

export const metadata: Metadata = {
  title: "Verify a Certificate | The Mind Point",
  description:
    "Enter a certificate's verification code to confirm a The Mind Point course completion.",
};

export default function CertificateVerifyIndexPage() {
  return <CertificateVerifyEntry />;
}
