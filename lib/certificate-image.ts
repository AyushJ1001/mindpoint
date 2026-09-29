"use client";

import type { CertificateData } from "@/components/lms/Certificate";
import { certificateCourseTitle } from "@/lib/certificate-title";

/**
 * Rasterises the issued certificate to a PNG for download.
 *
 * The on-screen sheet overlays real text on the owner's template, which is
 * exactly what this reproduces on a canvas, so what a learner downloads matches
 * what they see (and prints). The browser print path stays for a PDF; this is
 * the one-tap download for phones, where the print dialog is awkward.
 */

const TEMPLATE_SRC = "/brand/certificate-template.jpg";
const SEAL_SRC = "/brand/the-mind-point-seal-transparent.png";

const NAME_COLOR = "#17333f";
const META_COLOR = "#284557";
const NOTE_COLOR = "rgba(40, 69, 87, 0.52)";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

function fontFamily(variable: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value || fallback;
}

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ms));
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerX: number,
  edgeY: number,
  lineHeight: number,
  align: "above" | "middle",
) {
  const totalHeight = lines.length * lineHeight;
  const firstBaseline =
    align === "above"
      ? edgeY - totalHeight + lineHeight
      : edgeY - totalHeight / 2 + lineHeight;
  lines.forEach((line, index) => {
    ctx.fillText(line, centerX, firstBaseline + index * lineHeight);
  });
}

export async function renderCertificatePng(
  data: CertificateData,
): Promise<Blob> {
  const [template, seal] = await Promise.all([
    loadImage(TEMPLATE_SRC),
    loadImage(SEAL_SRC),
  ]);
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const width = 2237;
  const height = Math.round(
    (width * template.naturalHeight) / template.naturalWidth,
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");

  ctx.drawImage(template, 0, 0, width, height);

  const syne = fontFamily("--font-syne", "Georgia, serif");
  const dmSans = fontFamily("--font-dm-sans", "system-ui, sans-serif");

  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = NAME_COLOR;

  const nameSize = width * 0.032;
  ctx.font = `500 ${nameSize}px ${syne}`;
  drawCenteredLines(
    ctx,
    wrapLines(ctx, data.recipientName, width * 0.66),
    width * 0.5,
    height * 0.577,
    nameSize * 1.18,
    "above",
  );

  const courseSize = width * 0.02;
  ctx.font = `400 ${courseSize}px ${syne}`;
  drawCenteredLines(
    ctx,
    wrapLines(
      ctx,
      certificateCourseTitle(data.courseName, data.courseType),
      width * 0.56,
    ),
    width * 0.5,
    height * 0.694,
    courseSize * 1.05,
    "above",
  );

  const metaSize = width * 0.016;
  ctx.font = `400 ${metaSize}px ${dmSans}`;
  ctx.fillStyle = META_COLOR;
  ctx.fillText(formatDate(data.issuedAt), width * 0.5, height * 0.779);
  ctx.fillText(data.verificationCode, width * 0.768, height * 0.779);

  const sealWidth = width * 0.13;
  const sealHeight = sealWidth * (seal.naturalHeight / seal.naturalWidth);
  ctx.drawImage(
    seal,
    width * 0.145 - sealWidth / 2,
    height * 0.784 - sealHeight,
    sealWidth,
    sealHeight,
  );

  const noteSize = width * 0.0072;
  ctx.font = `400 ${noteSize}px ${dmSans}`;
  ctx.fillStyle = NOTE_COLOR;
  const noteLines = wrapLines(
    ctx,
    "This certificate records completion of a training programme. It is not a degree, licence or accreditation. Verify it any time at themindpoint.org/verify",
    width * 0.84,
  );
  drawCenteredLines(
    ctx,
    noteLines,
    width * 0.5,
    height * 0.955,
    noteSize * 1.3,
    "middle",
  );

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create the certificate image"));
    }, "image/png");
  });
}

export async function downloadCertificatePng(
  data: CertificateData,
): Promise<void> {
  const blob = await renderCertificatePng(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `The-Mind-Point-Certificate-${data.verificationCode}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
