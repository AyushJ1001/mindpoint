"use client";

import type { LmsLearningMode } from "@/lib/lms-api";
import { certificateCourseTitle } from "@/lib/certificate-title";

/**
 * The issued certificate, drawn as an inline SVG. The owner's botanical
 * template is the sheet; the learner's details and the seal are real SVG nodes
 * in a fixed viewBox, so the sheet scales to any container in any browser —
 * no container queries, no measured widths, no script. Prints to A4 landscape.
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

// The template's pixel size. All positions are fractions of it, so the viewBox
// scales the whole sheet together.
const SHEET_WIDTH = 1491;
const SHEET_HEIGHT = 1055;

const SERIF = "var(--font-syne), Georgia, serif";
const SANS = "var(--font-dm-sans), system-ui, sans-serif";
const INK = "#17333f";
const META = "#284557";

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ms));
}

/** CSS anchored text bottoms at a percentage; convert to an SVG baseline. */
function baseline(topFraction: number, fontSize: number): number {
  return SHEET_HEIGHT * topFraction - fontSize * 0.2;
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

  const title = certificateCourseTitle(data.courseName, data.courseType);
  const nameSize = SHEET_WIDTH * 0.032;
  const courseSize = SHEET_WIDTH * 0.02;
  const metaSize = SHEET_WIDTH * 0.016;
  const sealWidth = SHEET_WIDTH * 0.13;
  const sealHeight = sealWidth * (280 / 320);
  const sealCenterX = SHEET_WIDTH * 0.145;
  const sealBottom = SHEET_HEIGHT * 0.784;

  return (
    <svg
      className={`certificate-sheet ${className}`}
      viewBox={`0 0 ${SHEET_WIDTH} ${SHEET_HEIGHT}`}
      role="img"
      aria-label={`Certificate of completion for ${data.recipientName}, ${title}`}
    >
      <image
        href="/brand/certificate-template.jpg"
        x={0}
        y={0}
        width={SHEET_WIDTH}
        height={SHEET_HEIGHT}
      />
      <text
        x={SHEET_WIDTH / 2}
        y={baseline(0.577, nameSize)}
        textAnchor="middle"
        fontSize={nameSize}
        fontWeight={500}
        fill={INK}
        style={{ fontFamily: SERIF, letterSpacing: "0.012em" }}
      >
        {data.recipientName}
      </text>
      <text
        x={SHEET_WIDTH / 2}
        y={baseline(0.694, courseSize)}
        textAnchor="middle"
        fontSize={courseSize}
        fill={INK}
        style={{ fontFamily: SERIF }}
      >
        {title}
      </text>
      <text
        x={SHEET_WIDTH / 2}
        y={baseline(0.779, metaSize)}
        textAnchor="middle"
        fontSize={metaSize}
        fill={META}
        style={{ fontFamily: SANS }}
      >
        {formatDate(data.issuedAt)}
      </text>
      <text
        x={SHEET_WIDTH * 0.768}
        y={baseline(0.779, metaSize)}
        textAnchor="middle"
        fontSize={metaSize}
        fill={META}
        style={{ fontFamily: SANS }}
      >
        {data.verificationCode}
      </text>
      <image
        href="/brand/the-mind-point-seal-transparent.png"
        x={sealCenterX - sealWidth / 2}
        y={sealBottom - sealHeight}
        width={sealWidth}
        height={sealHeight}
      />
      <text
        x={SHEET_WIDTH / 2}
        y={SHEET_HEIGHT * 0.955}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={SHEET_WIDTH * 0.0072}
        fill={META}
        fillOpacity={0.52}
        style={{ fontFamily: SANS }}
      >
        This certificate records completion of a training programme. It is not a
        degree, licence or accreditation. Verify it any time at
        themindpoint.org/verify
      </text>
    </svg>
  );
}
