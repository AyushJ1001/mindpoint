export type InternshipPlan = "120" | "240";

export function extractInternshipPlanFromDuration(
  duration?: string,
): InternshipPlan | null {
  if (!duration) return null;

  const durationLower = duration.toLowerCase().trim();

  if (durationLower.includes("120") || durationLower.includes("2 week")) {
    return "120";
  }
  if (durationLower.includes("240") || durationLower.includes("4 week")) {
    return "240";
  }

  const weekMatch = durationLower.match(/(\d+)\s*week/);
  if (weekMatch) {
    const weeks = Number.parseInt(weekMatch[1], 10);
    if (weeks <= 2) return "120";
    if (weeks >= 4) return "240";
  }

  const hourMatch = durationLower.match(/(\d+)\s*hour/);
  if (hourMatch) {
    const hours = Number.parseInt(hourMatch[1], 10);
    if (hours <= 120) return "120";
    if (hours >= 240) return "240";
  }

  return null;
}

export function calculateInternshipEndDate(
  startDate: string | undefined,
  internshipPlan: InternshipPlan,
): string {
  const parsedStart = startDate ? new Date(startDate) : new Date();
  const start = Number.isNaN(parsedStart.getTime()) ? new Date() : parsedStart;
  const weeks = internshipPlan === "120" ? 2 : 4;
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + weeks * 7);

  return endDate.toISOString().split("T")[0];
}

export function generateEnrollmentNumber(
  courseCode: string,
  startDate: string,
): string {
  const date = new Date(startDate);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  const timestamp = Date.now().toString(36).toUpperCase();
  const entropy = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  return `EN-${courseCode}-${month}${year}-${timestamp}-${entropy}`;
}

export function roundCurrency(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value!));
}
