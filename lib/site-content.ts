// Shared, dependency-free content schema for the admin-editable storefront copy.
//
// The website renders code defaults, then layers any Convex `siteContent`
// override on top. Keep this file free of React/Next/Convex imports so it can be
// shared by both the Convex backend and the app.

export const COURSE_TYPE_SLUGS = [
  "certificate",
  "diploma",
  "internship",
  "therapy",
  "supervised",
  "pre-recorded",
  "masterclass",
  "resume-studio",
  "worksheet",
] as const;

export type CourseTypeSlug = (typeof COURSE_TYPE_SLUGS)[number];

export const CBT_LANDING_SLUG = "cbt-rebt-cbmt";

export function courseTypeContentKey(type: string): string {
  return `courseType:${type}`;
}

export const CBT_LANDING_CONTENT_KEY = `landing:${CBT_LANDING_SLUG}`;

export type SiteContentKind = "courseType" | "cbtLanding";

export interface ContentItem {
  title: string;
  description: string;
  icon?: string;
}

export interface ContentFaq {
  question: string;
  answer: string;
}

export interface ContentClosing {
  headline?: string;
  body?: string;
  primaryLabel?: string;
  primaryFallbackLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export interface CourseTypeContentOverride {
  title?: string;
  tagline?: string;
  description?: string;
  proof?: string[];
  painPoints?: string[];
  outcomes?: string[];
  whoShouldDo?: {
    title?: string;
    description?: string;
    items?: ContentItem[];
  };
  whyChoose?: {
    title?: string;
    description?: string;
    items?: ContentItem[];
  };
  faqs?: ContentFaq[];
  closing?: ContentClosing;
}

export interface CbtLandingOverride {
  name?: string;
  eyebrow?: string;
  tagline?: string;
  description?: string;
  proof?: string[];
  painPoints?: string[];
  outcomes?: string[];
  learningOutcomes?: string[];
  whyDifferent?: string[];
  modules?: ContentItem[];
  whoItsFor?: ContentItem[];
  faqs?: ContentFaq[];
  closing?: ContentClosing;
}

export interface SiteContentOption {
  key: string;
  slug: string;
  kind: SiteContentKind;
  label: string;
}

const COURSE_TYPE_LABELS: Record<CourseTypeSlug, string> = {
  certificate: "Certificate Courses",
  diploma: "Diploma Programs",
  internship: "Internship Programs",
  therapy: "Therapy & Counselling",
  supervised: "Supervised Practice",
  "pre-recorded": "Pre-recorded Courses",
  masterclass: "Masterclasses",
  "resume-studio": "Resume Studio",
  worksheet: "Worksheets & Resources",
};

export const SITE_CONTENT_OPTIONS: SiteContentOption[] = [
  ...COURSE_TYPE_SLUGS.map((slug) => ({
    key: courseTypeContentKey(slug),
    slug,
    kind: "courseType" as const,
    label: `Course page · ${COURSE_TYPE_LABELS[slug]}`,
  })),
  {
    key: CBT_LANDING_CONTENT_KEY,
    slug: CBT_LANDING_SLUG,
    kind: "cbtLanding" as const,
    label: "Landing page · CBT, REBT & CBMT",
  },
];

export function getSiteContentKind(key: string): SiteContentKind | null {
  return SITE_CONTENT_OPTIONS.find((option) => option.key === key)?.kind ?? null;
}

// ---------------------------------------------------------------------------
// Validation. Admin input is untrusted, so every submit is sanitised into the
// exact shape the renderer expects. Unknown fields are rejected so drift is
// caught early.
// ---------------------------------------------------------------------------

const MAX_STRING = 4000;
const MAX_ARRAY = 40;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertAllowedKeys(
  record: Record<string, unknown>,
  allowed: string[],
  at: string,
) {
  for (const key of Object.keys(record)) {
    if (!allowed.includes(key)) {
      throw new Error(`${at}: unexpected field "${key}"`);
    }
  }
}

function string(value: unknown, at: string): string {
  if (typeof value !== "string") {
    throw new Error(`${at} must be text`);
  }
  if (value.length > MAX_STRING) {
    throw new Error(`${at} is too long (max ${MAX_STRING} characters)`);
  }
  return value;
}

function optionalString(value: unknown, at: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  return string(value, at);
}

function stringArray(value: unknown, at: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${at} must be a list`);
  }
  if (value.length > MAX_ARRAY) {
    throw new Error(`${at} has too many entries (max ${MAX_ARRAY})`);
  }
  return value.map((entry, i) => string(entry, `${at}[${i}]`));
}

function items(
  value: unknown,
  at: string,
  { withIcon }: { withIcon: boolean },
): ContentItem[] {
  if (!Array.isArray(value)) {
    throw new Error(`${at} must be a list`);
  }
  if (value.length > MAX_ARRAY) {
    throw new Error(`${at} has too many entries (max ${MAX_ARRAY})`);
  }
  return value.map((entry, i) => {
    if (!isRecord(entry)) {
      throw new Error(`${at}[${i}] must be an object`);
    }
    assertAllowedKeys(entry, ["title", "description", "icon"], `${at}[${i}]`);
    const item: ContentItem = {
      title: string(entry.title, `${at}[${i}].title`),
      description: string(entry.description, `${at}[${i}].description`),
    };
    if (withIcon) {
      item.icon = optionalString(entry.icon, `${at}[${i}].icon`) ?? "";
    }
    return item;
  });
}

function faqs(value: unknown, at: string): ContentFaq[] {
  if (!Array.isArray(value)) {
    throw new Error(`${at} must be a list`);
  }
  if (value.length > MAX_ARRAY) {
    throw new Error(`${at} has too many entries (max ${MAX_ARRAY})`);
  }
  return value.map((entry, i) => {
    if (!isRecord(entry)) {
      throw new Error(`${at}[${i}] must be an object`);
    }
    assertAllowedKeys(entry, ["question", "answer"], `${at}[${i}]`);
    return {
      question: string(entry.question, `${at}[${i}].question`),
      answer: string(entry.answer, `${at}[${i}].answer`),
    };
  });
}

function closing(value: unknown, at: string): ContentClosing {
  if (!isRecord(value)) {
    throw new Error(`${at} must be an object`);
  }
  const allowed = [
    "headline",
    "body",
    "primaryLabel",
    "primaryFallbackLabel",
    "primaryHref",
    "secondaryLabel",
    "secondaryHref",
  ];
  assertAllowedKeys(value, allowed, at);
  const result: ContentClosing = {};
  for (const key of allowed) {
    const parsed = optionalString(value[key], `${at}.${key}`);
    if (parsed !== undefined) {
      (result as Record<string, string>)[key] = parsed;
    }
  }
  return result;
}

export function sanitizeCourseTypeOverride(
  data: unknown,
): CourseTypeContentOverride {
  if (!isRecord(data)) {
    throw new Error("Content must be an object");
  }
  const allowed = [
    "title",
    "tagline",
    "description",
    "proof",
    "painPoints",
    "outcomes",
    "whoShouldDo",
    "whyChoose",
    "faqs",
    "closing",
  ];
  assertAllowedKeys(data, allowed, "courseType");

  const result: CourseTypeContentOverride = {};
  const title = optionalString(data.title, "title");
  if (title !== undefined) result.title = title;
  const tagline = optionalString(data.tagline, "tagline");
  if (tagline !== undefined) result.tagline = tagline;
  const description = optionalString(data.description, "description");
  if (description !== undefined) result.description = description;
  if (data.proof !== undefined) result.proof = stringArray(data.proof, "proof");
  if (data.painPoints !== undefined)
    result.painPoints = stringArray(data.painPoints, "painPoints");
  if (data.outcomes !== undefined)
    result.outcomes = stringArray(data.outcomes, "outcomes");

  if (data.whoShouldDo !== undefined) {
    const who = data.whoShouldDo;
    if (!isRecord(who)) throw new Error("whoShouldDo must be an object");
    assertAllowedKeys(who, ["title", "description", "items"], "whoShouldDo");
    result.whoShouldDo = {};
    const whoTitle = optionalString(who.title, "whoShouldDo.title");
    if (whoTitle !== undefined) result.whoShouldDo.title = whoTitle;
    const whoDescription = optionalString(
      who.description,
      "whoShouldDo.description",
    );
    if (whoDescription !== undefined)
      result.whoShouldDo.description = whoDescription;
    if (who.items !== undefined)
      result.whoShouldDo.items = items(who.items, "whoShouldDo.items", {
        withIcon: true,
      });
  }

  if (data.whyChoose !== undefined) {
    const why = data.whyChoose;
    if (!isRecord(why)) throw new Error("whyChoose must be an object");
    assertAllowedKeys(why, ["title", "description", "items"], "whyChoose");
    result.whyChoose = {};
    const whyTitle = optionalString(why.title, "whyChoose.title");
    if (whyTitle !== undefined) result.whyChoose.title = whyTitle;
    const whyDescription = optionalString(
      why.description,
      "whyChoose.description",
    );
    if (whyDescription !== undefined)
      result.whyChoose.description = whyDescription;
    if (why.items !== undefined)
      result.whyChoose.items = items(why.items, "whyChoose.items", {
        withIcon: false,
      });
  }

  if (data.faqs !== undefined) result.faqs = faqs(data.faqs, "faqs");
  if (data.closing !== undefined) result.closing = closing(data.closing, "closing");

  return result;
}

export function sanitizeCbtOffset(data: unknown): CbtLandingOverride {
  if (!isRecord(data)) {
    throw new Error("Content must be an object");
  }
  const allowed = [
    "name",
    "eyebrow",
    "tagline",
    "description",
    "proof",
    "painPoints",
    "outcomes",
    "learningOutcomes",
    "whyDifferent",
    "modules",
    "whoItsFor",
    "faqs",
    "closing",
  ];
  assertAllowedKeys(data, allowed, "cbtLanding");

  const result: CbtLandingOverride = {};
  for (const key of [
    "name",
    "eyebrow",
    "tagline",
    "description",
  ] as const) {
    const parsed = optionalString(data[key], key);
    if (parsed !== undefined) result[key] = parsed;
  }
  if (data.proof !== undefined) result.proof = stringArray(data.proof, "proof");
  if (data.painPoints !== undefined)
    result.painPoints = stringArray(data.painPoints, "painPoints");
  if (data.outcomes !== undefined)
    result.outcomes = stringArray(data.outcomes, "outcomes");
  if (data.learningOutcomes !== undefined)
    result.learningOutcomes = stringArray(
      data.learningOutcomes,
      "learningOutcomes",
    );
  if (data.whyDifferent !== undefined)
    result.whyDifferent = stringArray(data.whyDifferent, "whyDifferent");
  if (data.modules !== undefined)
    result.modules = items(data.modules, "modules", { withIcon: false });
  if (data.whoItsFor !== undefined)
    result.whoItsFor = items(data.whoItsFor, "whoItsFor", { withIcon: false });
  if (data.faqs !== undefined) result.faqs = faqs(data.faqs, "faqs");
  if (data.closing !== undefined) result.closing = closing(data.closing, "closing");

  return result;
}

export function sanitizeSiteContent(key: string, data: unknown): unknown {
  const kind = getSiteContentKind(key);
  if (kind === "courseType") {
    return sanitizeCourseTypeOverride(data);
  }
  if (kind === "cbtLanding") {
    return sanitizeCbtOffset(data);
  }
  throw new Error(`Unknown content key: ${key}`);
}
