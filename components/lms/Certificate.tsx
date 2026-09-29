"use client";

import Image from "next/image";

import type { LmsLearningMode } from "@/lib/lms-api";

/**
 * The issued certificate. The owner's botanical template is the sheet; the
 * learner's details and the seal are overlaid so they stay real text (and the
 * public verify page can render the same thing). Prints to A4 landscape.
 */

export interface CertificateData {
  recipientName: string;
  courseName: string;
  verificationCode: string;
  issuedAt: number;
  learningMode?: LmsLearningMode;
  /** Course type, which selects the visual family. */
  courseType?: string;
}

/**
 * Types that never carry a completion certificate. A therapy or supervised
 * session is a service, not a programme of study, so it has no curriculum to
 * complete. Kept here so the certificate can refuse one rather than imply a
 * credential that was never earned.
 */
export const NON_CERTIFICATE_TYPES = new Set([
  "therapy",
  "worksheet",
  "resume-studio",
]);

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ms));
}

export function Certificate({
  data,
  className = "",
}: {
  data: CertificateData;
  className?: string;
}) {
  // A service with no curriculum cannot have a completion certificate.
  if (data.courseType && NON_CERTIFICATE_TYPES.has(data.courseType)) {
    return (
      <div className="certificate-unavailable">
        <p>
          {data.courseName} is a service, not a course of study, so it does not
          carry a completion certificate.
        </p>
      </div>
    );
  }

  return (
    <figure
      className={`certificate-sheet ${className}`}
      aria-label={`Certificate of completion for ${data.recipientName}`}
    >
      <p className="certificate-name">{data.recipientName}</p>
      <p className="certificate-course">{data.courseName}</p>
      <p className="certificate-date">{formatDate(data.issuedAt)}</p>
      <p className="certificate-number">{data.verificationCode}</p>
      <Image
        className="certificate-signature"
        src="/brand/the-mind-point-seal-transparent.png"
        alt="The Mind Point seal"
        width={320}
        height={280}
      />
      <p className="certificate-note">
        This certificate records completion of a training programme. It is not a
        degree, licence or accreditation. Verify it any time at
        themindpoint.org/verify
      </p>
    </figure>
  );
}
