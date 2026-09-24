import type { PublicCourse } from "@/lib/backend";

const TYPE_LABELS: Record<string, string> = {
  certificate: "Certificate Course",
  diploma: "Diploma Programme",
  internship: "Internship Programme",
  masterclass: "Masterclass",
  "pre-recorded": "Self-paced Course",
  therapy: "Therapy",
  supervised: "Supervised Practice",
  worksheet: "Worksheets & Resources",
  "resume-studio": "Resume Studio",
};

export function typeLabel(type?: string | null): string {
  if (!type) return "Course";
  return (
    TYPE_LABELS[type] ??
    type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, year, month, day] = iso;
    const monthName = MONTHS[Number(month) - 1];
    if (monthName) return `${Number(day)} ${monthName} ${year}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getDate()} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }

  return trimmed;
}

export function formatTime(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return trimmed;
  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "pm" : "am";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${minutes} ${suffix}`;
}

export function scheduleLine(course: PublicCourse): string {
  const days = (course.daysOfWeek ?? []).filter(Boolean);
  const time = formatTime(course.startTime);
  if (days.length > 0 && time) return `${days.join(" · ")} · ${time}`;
  if (time) return time;
  return course.duration ?? "";
}

export function cleanLines(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function cleanList(value?: (string | undefined | null)[]): string[] {
  return (value ?? [])
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}
