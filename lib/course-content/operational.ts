import type { PublicCourse } from "@/lib/backend";
import { programmeSlugForCode } from "@/lib/course-content";
import type {
  CourseContent,
  ProgrammeOption,
} from "@/lib/course-content/types";

const APPLIED_MATCH = /\b(cbt|rebt|cbmt)\b/i;
const INTRO_MATCH =
  /(intro|introduction|foundation|self[\s-]?paced).*(cbt|rebt|cbmt)|(cbt|rebt|cbmt).*(intro|introduction|foundation|self[\s-]?paced)/i;

/**
 * Resolve the catalogue row for an option. `catalogueCode` is authoritative
 * when present; the CBT-era name regexes remain as a fallback.
 */
function matchCatalogue(
  key: string,
  catalogueCode: string | undefined,
  catalogue: PublicCourse[],
): PublicCourse | undefined {
  if (catalogueCode) {
    const byCode = catalogue.find((item) => item.code === catalogueCode);
    if (byCode) return byCode;
  }
  if (key === "applied") {
    return catalogue.find(
      (item) => item.type === "certificate" && APPLIED_MATCH.test(item.name),
    );
  }
  if (key === "introductory" || key === "self-paced") {
    return catalogue.find((item) => INTRO_MATCH.test(item.name));
  }
  return undefined;
}

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "pm" : "am";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${match[2]} ${suffix}`;
}

function scheduleFor(course: PublicCourse): string | undefined {
  const batch = (
    course as {
      nextAvailableBatch?: {
        label?: string;
        startDate?: string;
        startTime?: string;
        endTime?: string;
        daysOfWeek?: string[];
      };
    }
  ).nextAvailableBatch;

  const date = formatDate(batch?.startDate ?? course.startDate);
  const days = batch?.daysOfWeek?.join(" & ");
  const start = formatTime(batch?.startTime);
  const end = formatTime(batch?.endTime);
  const time = start && end ? `${start}–${end}` : undefined;

  const parts = [
    batch?.label,
    date ? `Starts ${date}` : undefined,
    days,
    time ? `${time} IST` : undefined,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function priceFor(course: PublicCourse): ProgrammeOption["price"] | undefined {
  if (typeof course.price !== "number" || course.price <= 0) return undefined;
  return { amount: course.price, currency: "INR" };
}

/**
 * Binds real operational facts (price, schedule, checkout link, state) from the
 * programme catalogue onto the brief's option cards. Any fact that is not
 * configured stays absent, so its label is simply not rendered.
 */
export function attachOperationalData(
  course: CourseContent,
  catalogue: PublicCourse[],
): CourseContent {
  if (course.layout !== "brief" || !course.options) return course;

  const items = course.options.items.map((option) => {
    const match = matchCatalogue(option.key, option.catalogueCode, catalogue);

    if (!match) return option;

    return {
      ...option,
      price: priceFor(match),
      schedule: scheduleFor(match),
      cta: {
        ...option.cta,
        // Applied flagship courses redirect to their programme page when
        // browsed, so enrolment asks for the catalogue page explicitly.
        href: `/courses/${match._id}${
          programmeSlugForCode(match.code) ? "?checkout=1" : ""
        }`,
        state: "enroll" as const,
      },
    };
  });

  return { ...course, options: { ...course.options, items } };
}
