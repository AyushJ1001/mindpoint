"use client";

import Image from "next/image";

import type { LmsLearningMode } from "@/lib/lms-api";

/**
 * The issued certificate. One template, themed by course family so a formal
 * certificate, a self-paced intro and a masterclass read differently while
 * sharing the same frame. Prints to A4 landscape from the browser.
 *
 * The frame, leaf sprigs and gold hairlines are drawn as SVG so the sheet
 * scales cleanly at any size and prints sharply without a raster backdrop.
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

interface Theme {
  label: string;
  ink: string;
  accent: string;
  gold: string;
  leaf: string;
  washTop: string;
  washBottom: string;
  /** Formal credentials get the full treatment; lighter families stay calm. */
  formal: boolean;
}

/**
 * Four families, matching the four designs: formal credentials (deep teal and
 * gold), self-paced intros (watercolour cream), applied programmes (white
 * minimal) and therapy/masterclass (warm blush).
 */
const FAMILY_THEME: Record<string, Theme> = {
  formal: {
    label: "Completion",
    ink: "#0b3b3c",
    accent: "#0c6f73",
    gold: "#b9924f",
    leaf: "#1d4e4a",
    washTop: "#f2f8f8",
    washBottom: "#e6f0ee",
    formal: true,
  },
  intro: {
    label: "Self-paced completion",
    ink: "#123a37",
    accent: "#2c6a63",
    gold: "#c9a86a",
    leaf: "#7fb3a4",
    washTop: "#fdfaf2",
    washBottom: "#f2ece0",
    formal: false,
  },
  applied: {
    label: "Applied completion",
    ink: "#1c2b2b",
    accent: "#3d6b63",
    gold: "#b9b3a4",
    leaf: "#c3d6cd",
    washTop: "#ffffff",
    washBottom: "#f6f7f5",
    formal: false,
  },
  warm: {
    label: "Attendance",
    ink: "#3a2e2c",
    accent: "#9c6f63",
    gold: "#c8a17a",
    leaf: "#d9b8a8",
    washTop: "#fdf7f2",
    washBottom: "#f7e9df",
    formal: false,
  },
};

const TYPE_TO_FAMILY: Record<string, keyof typeof FAMILY_THEME> = {
  certificate: "formal",
  diploma: "formal",
  internship: "applied",
  supervised: "applied",
  "pre-recorded": "intro",
  masterclass: "intro",
  therapy: "warm",
  worksheet: "intro",
  "resume-studio": "applied",
};

const MODE_TO_FAMILY: Record<LmsLearningMode, keyof typeof FAMILY_THEME> = {
  self_paced: "intro",
  hybrid: "formal",
  cohort: "formal",
  event: "warm",
};

const MODE_LABEL: Record<LmsLearningMode, string> = {
  self_paced: "Self-paced completion",
  hybrid: "Live cohort completion",
  cohort: "Cohort completion",
  event: "Masterclass attendance",
};

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

function resolveTheme(data: CertificateData): Theme {
  const family = data.courseType
    ? TYPE_TO_FAMILY[data.courseType]
    : data.learningMode
      ? MODE_TO_FAMILY[data.learningMode]
      : "intro";
  const theme = FAMILY_THEME[family ?? "intro"];
  const label = data.learningMode ? MODE_LABEL[data.learningMode] : theme.label;
  return { ...theme, label };
}

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ms));
}

/** A leafy sprig, drawn once and mirrored into each corner. */
function Sprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 420"
      className="certificate-sprig"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Main stem. */}
      <path
        d="M96 414 C92 330 84 250 92 168 C98 110 108 66 122 20"
        fill="none"
        stroke="var(--cert-gold, #b9924f)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Paired leaves: [tipX, tipY, length, rotation, opacity]. */}
      {[
        [40, 320, 62, -26, 0.95],
        [132, 292, 66, 24, 0.8],
        [34, 232, 58, -30, 0.9],
        [128, 200, 62, 28, 0.75],
        [40, 146, 54, -32, 0.85],
        [124, 116, 58, 30, 0.7],
        [52, 72, 48, -34, 0.8],
        [112, 46, 50, 32, 0.65],
      ].map(([x, y, len, rot, opacity], index) => (
        <g
          key={index}
          transform={`translate(${x} ${y}) rotate(${rot})`}
          opacity={opacity}
        >
          <path
            d={`M0 0 C ${len * 0.35} ${-len * 0.22}, ${len * 0.75} ${-len * 0.2}, ${len} 0 C ${len * 0.75} ${len * 0.2}, ${len * 0.35} ${len * 0.22}, 0 0 Z`}
            fill="var(--cert-leaf, #2c6a63)"
          />
          <path
            d={`M0 0 L ${len} 0`}
            stroke="var(--cert-wash-top, #ffffff)"
            strokeWidth="1"
            opacity="0.55"
          />
        </g>
      ))}
    </svg>
  );
}

export function Certificate({
  data,
  className = "",
}: {
  data: CertificateData;
  className?: string;
}) {
  const theme = resolveTheme(data);

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
      style={
        {
          "--cert-ink": theme.ink,
          "--cert-accent": theme.accent,
          "--cert-gold": theme.gold,
          "--cert-leaf": theme.accent,
          "--cert-wash-top": theme.washTop,
          "--cert-wash-bottom": theme.washBottom,
        } as React.CSSProperties
      }
      aria-label={`Certificate of completion for ${data.recipientName}`}
    >
      <div className="certificate-frame" aria-hidden="true" />
      <div className="certificate-wash" aria-hidden="true" />
      <div className="certificate-sprigs" aria-hidden="true">
        <Sprig />
        <Sprig flip />
      </div>

      <div className="certificate-inner">
        <header className="certificate-head">
          <Image
            src="/brand/the-mind-point-logo.png"
            alt="The Mind Point"
            width={420}
            height={318}
            priority
            className="certificate-logo"
          />
          <p className="certificate-believe">LEARN · GROW · HEAL · BELONG.</p>
        </header>

        <div className="certificate-body">
          <h1 className="certificate-title">Certificate of Completion</h1>
          <div className="certificate-rule" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>

          <p className="certificate-presented">
            This certificate is proudly presented to
          </p>
          <p className="certificate-name">{data.recipientName}</p>

          <p className="certificate-completing">for successfully completing</p>
          <p className="certificate-course">{data.courseName}</p>
          <p className="certificate-mode">{theme.label}</p>
        </div>

        <footer className="certificate-foot">
          <div className="certificate-field">
            <span className="certificate-field-value">
              {formatDate(data.issuedAt)}
            </span>
            <span className="certificate-field-rule" aria-hidden="true" />
            <span className="certificate-field-label">Date</span>
          </div>

          <div className="certificate-seal">
            <Image
              src="/brand/the-mind-point-seal-transparent.png"
              alt="The Mind Point seal"
              width={320}
              height={320}
            />
          </div>

          <div className="certificate-field">
            <span className="certificate-field-value">
              {data.verificationCode}
            </span>
            <span className="certificate-field-rule" aria-hidden="true" />
            <span className="certificate-field-label">Certificate No.</span>
          </div>
        </footer>

        <p className="certificate-motto">
          Psychology Education for a Brighter Tomorrow.
        </p>
        <p className="certificate-note">
          This certificate records completion of a training programme. It is not
          a degree, licence or accreditation. Verify it any time at
          themindpoint.org/verify
        </p>
      </div>
    </figure>
  );
}
