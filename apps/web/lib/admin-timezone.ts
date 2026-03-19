export const ADMIN_TIME_ZONE_STORAGE_KEY = "mindpoint.admin.timeZone";

export const ADMIN_TIME_ZONE_OPTIONS = [
  { value: "America/Chicago", label: "CT" },
  { value: "America/New_York", label: "ET" },
  { value: "Asia/Kolkata", label: "IST" },
] as const;

export type AdminTimeZoneOption =
  (typeof ADMIN_TIME_ZONE_OPTIONS)[number]["value"];

const ADMIN_TIME_ZONE_LABELS = Object.fromEntries(
  ADMIN_TIME_ZONE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<AdminTimeZoneOption, string>;

export function isSupportedAdminTimeZone(
  value: string,
): value is AdminTimeZoneOption {
  return ADMIN_TIME_ZONE_OPTIONS.some((option) => option.value === value);
}

export function resolveDefaultAdminTimeZone(): AdminTimeZoneOption {
  if (typeof Intl !== "undefined") {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (isSupportedAdminTimeZone(detected)) {
      return detected;
    }

    try {
      const now = new Date();
      const detectedOffset = getTimeZoneOffsetMinutes(detected, now);
      let nearestOption: AdminTimeZoneOption = "America/New_York";
      let smallestDifference = Number.POSITIVE_INFINITY;

      for (const option of ADMIN_TIME_ZONE_OPTIONS) {
        const optionOffset = getTimeZoneOffsetMinutes(option.value, now);
        const difference = Math.abs(optionOffset - detectedOffset);

        if (difference < smallestDifference) {
          smallestDifference = difference;
          nearestOption = option.value;
        }
      }

      return nearestOption;
    } catch {
      return "America/New_York";
    }
  }

  return "America/New_York";
}

export function getAdminTimeZoneLabel(timeZone: string): string {
  return ADMIN_TIME_ZONE_LABELS[timeZone as AdminTimeZoneOption] ?? timeZone;
}

export function formatTimestampInTimeZone(
  value: number | string | Date,
  timeZone: string,
): string {
  const date = value instanceof Date ? value : new Date(value);

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function parsePlainDate(dateValue?: string): Date | null {
  if (!dateValue) {
    return null;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function parsePlainDateTime(
  dateValue?: string,
  timeValue?: string,
): Date | null {
  const date = parsePlainDate(dateValue);
  if (!date) {
    return null;
  }

  if (!timeValue) {
    return date;
  }

  const [hours, minutes] = timeValue.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return date;
  }

  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

export function formatPlainDateForAdmin(dateValue?: string): string | null {
  const date = parsePlainDate(dateValue);
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

export function formatPlainDateTimeForAdmin(
  dateValue?: string,
  timeValue?: string,
  timeZone?: string,
): string | null {
  const date = parsePlainDateTime(dateValue, timeValue);
  if (!date) {
    return null;
  }

  // Date/time form fields already hold wall-clock values in the currently
  // selected edit zone, so this formatter intentionally preserves those raw
  // values instead of converting them again.
  const formatted = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: timeValue ? "short" : undefined,
    timeZone: "UTC",
  }).format(date);

  return timeZone
    ? `${formatted} • ${getAdminTimeZoneLabel(timeZone)}`
    : formatted;
}

export function formatDateWindow(
  startDate: string,
  endDate: string,
  formatDate: (value?: string) => string | null,
): string | null {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) {
    return `${start} to ${end}`;
  }

  return start || end;
}

function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const zonedTimestamp = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return (zonedTimestamp - date.getTime()) / 60000;
}

function formatWallTimeParts(timestamp: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    dateValue: `${values.year}-${values.month}-${values.day}`,
    timeValue: `${values.hour}:${values.minute}`,
  };
}

export function convertPlainDateTimeBetweenTimeZones(
  dateValue: string,
  timeValue: string,
  fromTimeZone: string,
  toTimeZone: string,
): { dateValue: string; timeValue: string } | null {
  if (!dateValue || !timeValue || fromTimeZone === toTimeZone) {
    return dateValue && timeValue ? { dateValue, timeValue } : null;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null;
  }

  const wallClockTimestamp = Date.UTC(year, month - 1, day, hours, minutes);
  let utcTimestamp =
    wallClockTimestamp -
    getTimeZoneOffsetMinutes(fromTimeZone, new Date(wallClockTimestamp)) *
      60_000;

  const adjustedOffset = getTimeZoneOffsetMinutes(
    fromTimeZone,
    new Date(utcTimestamp),
  );
  utcTimestamp = wallClockTimestamp - adjustedOffset * 60_000;

  return formatWallTimeParts(utcTimestamp, toTimeZone);
}
