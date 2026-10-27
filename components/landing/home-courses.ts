import type { PublicCourse } from "@/lib/backend";
import { getCourseBySlug, programmeSlugForCode } from "@/lib/course-content";
import { formatTime } from "@/lib/course-content/operational";

/**
 * A homepage course row. `live` is only present when the course record loaded,
 * so the page never shows a date, price or seat count it cannot back up.
 */
export interface HomeCourse {
  code: string;
  name: string;
  href: string;
  /** A few learning outcomes from the course's content page. */
  outcomes: string[];
  live?: {
    startDate?: string;
    days?: string;
    time?: string;
    price?: number;
    seatsLeft?: number;
    capacity?: number;
  };
}

/** The January 2027 certificate courses, in start-date order. */
const JANUARY_CODES = [
  { code: "CCCBT", name: "CBT, REBT and CBMT", outcomes: [2, 3, 5] },
  { code: "CCPD", name: "Personality Disorders", outcomes: [1, 3, 4] },
  { code: "CCICH", name: "Inner Child Healing & Therapy", outcomes: [1, 2, 6] },
];

const INTERNSHIP = {
  code: "INCLP",
  name: "Counselling Psychology internship",
  outcomes: [],
};

function joinDays(days: string[]) {
  const short = days.map((day) => day.slice(0, 3));
  if (short.length <= 1) return short.join("");
  return `${short.slice(0, -1).join(", ")} & ${short[short.length - 1]}`;
}

function formatStartDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function toHomeCourse(
  entry: { code: string; name: string; outcomes: number[] },
  courses: PublicCourse[],
  /** Only show live details when the next batch starts with this prefix. */
  batchStartPrefix?: string,
): HomeCourse {
  const course = courses.find((c) => c.code === entry.code);
  const slug = programmeSlugForCode(entry.code);
  const content = slug ? getCourseBySlug(slug) : undefined;
  const outcomes = entry.outcomes
    .map((index) => content?.learningOutcomes[index])
    .filter((outcome): outcome is string => Boolean(outcome));
  const href = slug
    ? `/programs/${slug}`
    : course
      ? `/courses/${course._id}`
      : "/january-2027";

  const batch = course?.nextAvailableBatch;
  // A card in the January section must not paint a later cohort's dates.
  if (
    !course ||
    (batchStartPrefix && !batch?.startDate.startsWith(batchStartPrefix))
  ) {
    return { code: entry.code, name: entry.name, href, outcomes };
  }

  const start = formatTime(batch?.startTime);
  const end = formatTime(batch?.endTime);

  return {
    code: entry.code,
    name: entry.name,
    href,
    outcomes,
    live: {
      startDate: formatStartDate(batch?.startDate ?? course.startDate),
      days: batch?.daysOfWeek?.length ? joinDays(batch.daysOfWeek) : undefined,
      time: start && end ? `${start}–${end} IST` : undefined,
      price: course.price && course.price > 0 ? course.price : undefined,
      seatsLeft: batch
        ? Math.max(0, batch.capacity - batch.enrolledCount)
        : undefined,
      capacity: batch?.capacity,
    },
  };
}

/**
 * "19, 21 and 28 January 2027" when every January course has a loaded start
 * date in January 2027; otherwise undefined, so callers fall back to the month.
 */
function januaryStartSummary(courses: PublicCourse[]) {
  const days: number[] = [];
  for (const { code } of JANUARY_CODES) {
    const course = courses.find((c) => c.code === code);
    const value = course?.nextAvailableBatch?.startDate;
    const match = value?.match(/^2027-01-(\d{2})/);
    if (!match) return undefined;
    days.push(Number(match[1]));
  }
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const list =
    sorted.length === 1
      ? `${sorted[0]}`
      : `${sorted.slice(0, -1).join(", ")} and ${sorted[sorted.length - 1]}`;
  return `${list} January 2027`;
}

/**
 * The self-paced introduction fee, read from the pre-recorded courses on sale.
 * Undefined unless they all share one price, so the page never quotes a number
 * the catalogue does not agree on.
 */
function introPrice(courses: PublicCourse[]) {
  const prices = new Set(
    courses
      .filter((c) => c.type === "pre-recorded" && c.price && c.price > 0)
      .map((c) => c.price),
  );
  return prices.size === 1 ? [...prices][0] : undefined;
}

export function buildHomeCourses(courses: PublicCourse[]) {
  return {
    january: JANUARY_CODES.map((entry) =>
      toHomeCourse(entry, courses, "2027-01"),
    ),
    internship: toHomeCourse(INTERNSHIP, courses),
    startSummary: januaryStartSummary(courses),
    introPrice: introPrice(courses),
  };
}

export type HomeCourses = ReturnType<typeof buildHomeCourses>;
