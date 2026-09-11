export type LmsResource = {
  label: string;
  url: string;
};

export type LmsLessonContent = {
  notes: string;
  videoUrl?: string;
  releaseDate?: string;
  duration?: string;
  resources: LmsResource[];
};

const META_PREFIX = "<!--TMP_LMS_META:";
const META_SUFFIX = "-->";

function normalizeUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

function normalizeResource(value: unknown): LmsResource | null {
  if (!value || typeof value !== "object") return null;
  const resource = value as { label?: unknown; url?: unknown };
  const label = typeof resource.label === "string" ? resource.label.trim() : "";
  const url = typeof resource.url === "string" ? normalizeUrl(resource.url) : undefined;
  if (!url) return null;
  return {
    label: label || "Resource",
    url,
  };
}

export function stripLmsMetadata(description?: string) {
  if (!description) return "";
  const start = description.indexOf(META_PREFIX);
  if (start < 0) return description.trim();
  const end = description.indexOf(META_SUFFIX, start);
  if (end < 0) return description.trim();
  return `${description.slice(0, start)}${description.slice(end + META_SUFFIX.length)}`.trim();
}

export function parseLmsLessonDescription(description?: string): LmsLessonContent {
  const notes = stripLmsMetadata(description);
  if (!description) return { notes, resources: [] };

  const start = description.indexOf(META_PREFIX);
  const end = start >= 0 ? description.indexOf(META_SUFFIX, start) : -1;
  if (start < 0 || end < 0) return { notes, resources: [] };

  const encoded = description.slice(start + META_PREFIX.length, end).trim();
  try {
    const parsed = JSON.parse(decodeURIComponent(encoded)) as {
      videoUrl?: unknown;
      releaseDate?: unknown;
      duration?: unknown;
      resources?: unknown;
    };

    const resources = Array.isArray(parsed.resources)
      ? parsed.resources
          .map(normalizeResource)
          .filter((resource): resource is LmsResource => resource !== null)
      : [];

    return {
      notes,
      videoUrl:
        typeof parsed.videoUrl === "string" ? normalizeUrl(parsed.videoUrl) : undefined,
      releaseDate:
        typeof parsed.releaseDate === "string" && parsed.releaseDate.trim()
          ? parsed.releaseDate.trim()
          : undefined,
      duration:
        typeof parsed.duration === "string" && parsed.duration.trim()
          ? parsed.duration.trim()
          : undefined,
      resources,
    };
  } catch {
    return { notes, resources: [] };
  }
}

export function serializeLmsLessonDescription(content: LmsLessonContent) {
  const videoUrl = normalizeUrl(content.videoUrl);
  const resources = content.resources
    .map(normalizeResource)
    .filter((resource): resource is LmsResource => resource !== null);

  const metadata = {
    ...(videoUrl ? { videoUrl } : {}),
    ...(content.releaseDate?.trim()
      ? { releaseDate: content.releaseDate.trim() }
      : {}),
    ...(content.duration?.trim() ? { duration: content.duration.trim() } : {}),
    ...(resources.length > 0 ? { resources } : {}),
  };

  const hasMetadata = Object.keys(metadata).length > 0;
  const notes = content.notes.trim();
  if (!hasMetadata) return notes;

  return `${META_PREFIX}${encodeURIComponent(JSON.stringify(metadata))}${META_SUFFIX}${notes ? `\n${notes}` : ""}`;
}

export function parseResourcesText(value: string): LmsResource[] {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf("|");
      const label = separator >= 0 ? line.slice(0, separator).trim() : "Resource";
      const urlText = separator >= 0 ? line.slice(separator + 1).trim() : line;
      const url = normalizeUrl(urlText);
      return url ? { label: label || "Resource", url } : null;
    })
    .filter((resource): resource is LmsResource => resource !== null);
}

export function resourcesToText(resources: LmsResource[]) {
  return resources.map((resource) => `${resource.label} | ${resource.url}`).join("\n");
}

export function getLmsReleaseState(releaseDate?: string, now = new Date()) {
  if (!releaseDate) return { locked: false as const };
  const releaseAt = new Date(`${releaseDate}T00:00:00`);
  if (Number.isNaN(releaseAt.getTime())) return { locked: false as const };
  return {
    locked: now.getTime() < releaseAt.getTime(),
    releaseAt,
  };
}
