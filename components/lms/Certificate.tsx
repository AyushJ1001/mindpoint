"use client";

import Image from "next/image";

import type { LmsLearningMode } from "@/lib/lms-api";

/**
 * The issued certificate. One template, themed per learning mode, with the
 * learner's own details merged in. Renders on screen and prints to A4 landscape
 * from the browser ("Print or save PDF").
 *
 * The frame, leaf sprigs and gold hairlines are drawn as SVG so the sheet scales
 * cleanly at any size and prints sharply without a raster backdrop.
 */

export interface CertificateData {
  recipientName: string;
  courseName: string;
  verificationCode: string;
  issuedAt: number;
  learningMode?: LmsLearningMode;
}

interface Theme {
  label: string;
  ink: string;
  accent: string;
  gold: string;
  washTop: string;
  washBottom: string;
}

const MODE_THEME: Record<LmsLearningMode, Theme> = {
  self_paced: {
    label: "Self-paced completion",
    ink: "#0b3b3c",
    accent: "#0c6f73",
    gold: "#b9924f",
    washTop: "#f2f8f8",
    washBottom: "#e7f1ef",
  },
  hybrid: {
    label: "Live cohort completion",
    ink: "#0b3b3c",
    accent: "#0c6f73",
    gold: "#b9924f",
    washTop: "#f4f8f7",
    washBottom: "#e8f0ec",
  },
  cohort: {
    label: "Cohort completion",
    ink: "#123a37",
    accent: "#1d4e4a",
    gold: "#a9812f",
    washTop: "#f8f4ea",
    washBottom: "#efe6d3",
  },
  event: {
    label: "Masterclass attendance",
    ink: "#123a37",
    accent: "#2c6a63",
    gold: "#b9924f",
    washTop: "#f1f7f3",
    washBottom: "#e6efe9",
  },
};

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
  const theme = MODE_THEME[data.learningMode ?? "self_paced"];

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
              src="/brand/the-mind-point-seal.png"
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
