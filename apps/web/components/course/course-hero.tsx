"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Calendar, Clock, Award, Users, Star, BookOpen } from "lucide-react";
import { api } from "@mindpoint/backend/api";
import type { PublicCourse } from "@mindpoint/backend";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { defaultEmotionalHooks } from "@/lib/course-content-data";
import { formatCourseTimeRange } from "@/lib/course-schedule";
import { getEnrolledCount } from "@/lib/course-enrollment";
import { getCoursePrice, getOfferDetails } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Utilities kept here for backwards compatibility with consumers that import
// from this module (pricing-section.tsx, cart-related utils, etc.).
// ---------------------------------------------------------------------------

export function formatINR(value: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `\u20b9${value}`;
  }
}

export function parseUTCDateOnly(dateStr: string): Date | null {
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const match = isoDate.exec(dateStr);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(Date.UTC(year, month, day));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function getOrdinal(n: number) {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return "th";
  if (rem10 === 1) return "st";
  if (rem10 === 2) return "nd";
  if (rem10 === 3) return "rd";
  return "th";
}

export function formatDateCommon(dateStr: string) {
  const d = parseUTCDateOnly(dateStr);
  if (!d) return dateStr;
  const day = d.getUTCDate();
  const month = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  const year = d.getUTCFullYear();
  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

export function formatDateShort(dateStr: string) {
  const d = parseUTCDateOnly(dateStr);
  if (!d) return dateStr;
  const day = d.getUTCDate();
  const month = d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" });
  return `${day} ${month}`;
}

export function splitDescription(desc?: string | null): {
  lead: string;
  rest: string;
} {
  if (!desc) return { lead: "", rest: "" };
  const normalized = desc.trim().replace(/\s+/g, " ");
  if (!normalized) return { lead: "", rest: "" };
  const sentenceEnd = normalized.search(/[.!?](\s|$)/);
  if (sentenceEnd === -1) return { lead: normalized, rest: "" };
  const punct = normalized[sentenceEnd] ?? ".";
  const lead = `${normalized.slice(0, sentenceEnd).trim()}${punct}`;
  const rest = normalized.slice(sentenceEnd + 1).trim();
  return { lead, rest };
}

function prettyCourseType(type?: string): string {
  if (!type) return "Course";
  switch (type) {
    case "certificate":
      return "Certificate course";
    case "diploma":
      return "Diploma program";
    case "internship":
      return "Internship";
    case "therapy":
      return "Therapy";
    case "supervised":
      return "Supervised practice";
    case "pre-recorded":
      return "Self-paced course";
    case "masterclass":
      return "Masterclass";
    case "resume-studio":
      return "Resume studio";
    case "worksheet":
      return "Worksheet";
    default:
      return type
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

function tintClassFor(type?: string): string {
  switch (type) {
    case "certificate":
      return "calm-tint-certificate";
    case "diploma":
      return "calm-tint-diploma";
    case "therapy":
      return "calm-tint-therapy";
    case "supervised":
      return "calm-tint-supervised";
    case "internship":
      return "calm-tint-internship";
    case "pre-recorded":
      return "calm-tint-pre-recorded";
    case "masterclass":
      return "calm-tint-masterclass";
    case "worksheet":
      return "calm-tint-worksheet";
    case "resume-studio":
      return "calm-tint-resume-studio";
    default:
      return "calm-tint-certificate";
  }
}

interface BatchOption {
  _id: string;
  label: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  capacity: number;
  enrolledCount: number;
  isSelectable: boolean;
  availabilityStatus: string;
}

interface CourseHeroProps {
  course: PublicCourse;
  batches?: BatchOption[];
  activeBatchId?: string | null;
  onBatchSelect?: (id: string) => void;
  onAddToCart?: () => void;
}

function StarRow({ value, count }: { value: number; count: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="calm-stars">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rounded >= i;
        const half = !filled && rounded >= i - 0.5;
        return (
          <Star
            key={i}
            aria-hidden="true"
            className="h-[0.95rem] w-[0.95rem]"
            fill={filled || half ? "currentColor" : "none"}
            strokeWidth={1.5}
            style={half ? { clipPath: "inset(0 50% 0 0)" } : undefined}
          />
        );
      })}
      <span className="calm-stars-count">
        {value.toFixed(1)}
        {count > 0 ? ` \u00b7 ${count} review${count === 1 ? "" : "s"}` : ""}
      </span>
    </div>
  );
}

export default function CourseHero({
  course,
  batches = [],
  activeBatchId = null,
  onBatchSelect,
  onAddToCart,
}: CourseHeroProps) {
  const emotionalHook =
    course.emotionalHook ||
    defaultEmotionalHooks[course.type || "certificate"] ||
    "";

  const isPreRecorded = course.type === "pre-recorded";
  const isWorksheet = course.type === "worksheet";

  const { lead } = splitDescription(course.description);

  const reviews = useQuery(api.courses.listReviewsForCourse, {
    courseId: course._id,
  });
  const realReviews = (reviews ?? []).filter((r) => r.userId !== "placeholder");
  const reviewCount = realReviews.length;
  const averageRating =
    reviewCount > 0
      ? realReviews.reduce((s, r) => s + r.rating, 0) / reviewCount
      : 0;

  const offerDetails = getOfferDetails(course);
  const price = getCoursePrice(course);

  const seatsLeft = Math.max(
    0,
    (course.capacity ?? 0) - getEnrolledCount(course),
  );
  const isSoldOut = (course.capacity ?? 0) === 0 || seatsLeft === 0;

  const poster = course.imageUrls?.[0] ?? null;
  const tintClass = tintClassFor(course.type);

  const metaChips: { icon: React.ReactNode; label: string }[] = [];

  if (course.startDate && !isPreRecorded && !isWorksheet) {
    metaChips.push({
      icon: <Calendar />,
      label: `Starts ${formatDateShort(course.startDate)}`,
    });
  } else if (isPreRecorded) {
    metaChips.push({ icon: <Clock />, label: "Self-paced" });
  }

  const timeLabel = formatCourseTimeRange(course.startTime, course.endTime);
  const daysLabel = course.daysOfWeek?.length
    ? course.daysOfWeek.slice(0, 2).join(" / ")
    : null;
  if (!isPreRecorded && !isWorksheet && (daysLabel || timeLabel)) {
    metaChips.push({
      icon: <Clock />,
      label: [daysLabel, timeLabel].filter(Boolean).join(" \u00b7 "),
    });
  }

  if (course.duration) {
    metaChips.push({ icon: <Clock />, label: course.duration });
  }

  if (!isWorksheet) {
    metaChips.push({ icon: <Award />, label: "Live Classes + On-Demand Recordings + Official Certificate" });
  }

  if (seatsLeft > 0 && seatsLeft <= 8 && !isPreRecorded && !isWorksheet) {
    metaChips.push({
      icon: <Users />,
      label: `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left`,
    });
  }

  return (
    <section className="calm-section pt-14 sm:pt-20 lg:pt-24">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-6">
        <ScrollReveal>
          <nav
            aria-label="Breadcrumb"
            className="calm-kbd mb-10 flex items-center gap-3"
          >
            <Link
              href="/courses"
              className="transition-colors hover:text-primary"
            >
              Courses
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">
              {prettyCourseType(course.type)}
            </span>
          </nav>

          <div className="calm-hero-stage">
            <div className={`calm-hero-art ${tintClass}`}>
              {poster ? (
                <Image
                  src={poster}
                  alt={`${course.name} poster`}
                  width={800}
                  height={600}
                  priority
                  sizes="(min-width: 768px) 72vw, 100vw"
                  className="h-auto w-full"
                />
              ) : (
                <BookOpen
                  className="text-foreground/40"
                  strokeWidth={1}
                  aria-hidden="true"
                  style={{ width: "4rem", height: "4rem" }}
                />
              )}
            </div>

            <div className="calm-hero-copy">
              <p className="calm-kbd text-primary/80">
                {prettyCourseType(course.type)}
              </p>

              <h1 className="calm-hero-title mt-4 text-foreground">
                {course.name}
              </h1>

              {emotionalHook && (
                <p className="calm-hero-hook mt-5 max-w-[42ch]">
                  &ldquo;{emotionalHook}&rdquo;
                </p>
              )}

              {reviewCount > 0 && (
                <div className="mt-6">
                  <StarRow value={averageRating} count={reviewCount} />
                </div>
              )}

              {lead && (
                <p className="calm-hero-lead mt-6 max-w-[46ch]">{lead}</p>
              )}

              {metaChips.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {metaChips.map((chip, i) => (
                    <li key={i} className="calm-meta-chip">
                      <span aria-hidden="true">{chip.icon}</span>
                      <span>{chip.label}</span>
                    </li>
                  ))}
                </ul>
              )}

              {batches.length > 0 && onBatchSelect && (
                <div className="mt-8 border-t border-foreground/10 pt-6">
                  <p className="mb-4 text-[0.95rem] font-medium text-foreground/70">
                    Choose a batch
                  </p>
                  <div
                    className="flex flex-col gap-2.5"
                    role="radiogroup"
                    aria-label="Choose a batch"
                  >
                    {batches.map((batch) => {
                      const selected = activeBatchId === batch._id;
                      const disabled = !batch.isSelectable;
                      const statusLabel = !batch.isSelectable
                        ? batch.availabilityStatus === "upcoming_full"
                          ? "Full"
                          : "Closed"
                        : null;
                      const title = batch.label || "Batch option";
                      const dateStr = batch.startDate
                        ? `Starts ${formatDateCommon(batch.startDate)}`
                        : null;
                      const timeStr = formatCourseTimeRange(
                        batch.startTime,
                        batch.endTime,
                      );
                      const daysStr = batch.daysOfWeek?.length
                        ? batch.daysOfWeek.join(", ")
                        : null;
                      const detail = [daysStr, timeStr]
                        .filter(Boolean)
                        .join(" \u00b7 ");
                      const seatsRemaining = Math.max(
                        0,
                        batch.capacity - (batch.enrolledCount ?? 0),
                      );
                      return (
                        <button
                          key={batch._id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={disabled}
                          data-selected={selected ? "true" : "false"}
                          data-disabled={disabled ? "true" : "false"}
                          onClick={() =>
                            !disabled && onBatchSelect(batch._id)
                          }
                          className="calm-batch-chip"
                        >
                          <span className="min-w-0">
                            <span className="calm-batch-main block">
                              {title}
                            </span>
                            {dateStr && (
                              <span className="calm-batch-sub block">
                                {dateStr}
                              </span>
                            )}
                            {detail && (
                              <span className="calm-batch-sub block">
                                {detail}
                              </span>
                            )}
                            {batch.isSelectable &&
                              seatsRemaining > 0 &&
                              seatsRemaining <= 8 && (
                                <span className="calm-batch-sub mt-0.5 block text-primary/70">
                                  {seatsRemaining} seat
                                  {seatsRemaining === 1 ? "" : "s"} left
                                </span>
                              )}
                          </span>
                          {statusLabel && (
                            <span className="calm-batch-status">
                              {statusLabel}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isWorksheet && course.type !== "therapy" && course.type !== "supervised" && (
                <div className="mt-8 space-y-4 border-t border-foreground/10 pt-6">
                  <div className="calm-hero-price-row">
                    <span className="calm-price-big">{formatINR(price)}</span>
                    {offerDetails?.hasDiscount && (
                      <span className="calm-price-strike">
                        {formatINR(offerDetails.originalPrice)}
                      </span>
                    )}
                  </div>
                  <Button
                    size="lg"
                    disabled={isSoldOut}
                    onClick={onAddToCart}
                    className="h-11 w-full text-base font-medium"
                  >
                    {isSoldOut ? "Currently full" : "Add to cart"}
                  </Button>
                </div>
              )}

              {(course.type === "therapy" || course.type === "supervised") && (
                <div className="mt-8 border-t border-foreground/10 pt-6">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 w-full text-base font-medium"
                  >
                    <a href="#pricing">Choose a plan</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// Legacy compatibility: keep a no-op export used by older callers.
export function CourseScheduleSection({
  ...props
}: {
  course: PublicCourse;
  customDuration?: string;
}) {
  void props;
  return null;
}
