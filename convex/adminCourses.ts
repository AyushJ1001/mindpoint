import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  CourseBogoValue,
  CourseLifecycleStatus,
  CourseOfferValue,
  CourseType,
} from "./schema";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { normalizeCourseLifecycleStatus } from "./adminUtils";
import { createAdminAuditLog } from "./adminAudit";
import {
  convexFailure,
  convexResultErrorCode,
  convexSuccess,
  type ConvexFailure,
} from "./_shared/result";

const COURSE_INTEGRITY_SCAN_LIMIT = 2000;
const MASTERCLASS_REPAIR_BATCH_LIMIT = 50;
const BATCH_MIGRATION_SUPPORTED_TYPES = [
  "certificate",
  "diploma",
  "masterclass",
  "resume-studio",
] as const;

type AdminCourseFailure = ConvexFailure<
  "CONFLICT" | "NOT_FOUND" | "VALIDATION_ERROR"
>;

function adminCourseFailure(
  message: string,
  code:
    | "CONFLICT"
    | "NOT_FOUND"
    | "VALIDATION_ERROR" = convexResultErrorCode.VALIDATION_ERROR,
): AdminCourseFailure {
  return convexFailure({ code, message });
}

const coursePatchValidator = {
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  type: v.optional(CourseType),
  code: v.optional(v.string()),
  price: v.optional(v.number()),
  offer: v.optional(v.union(v.null(), CourseOfferValue)),
  bogo: v.optional(v.union(v.null(), CourseBogoValue)),
  sessions: v.optional(v.number()),
  capacity: v.optional(v.number()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
  daysOfWeek: v.optional(v.array(v.string())),
  content: v.optional(v.string()),
  duration: v.optional(v.string()),
  prerequisites: v.optional(v.string()),
  imageUrls: v.optional(v.array(v.string())),
  modules: v.optional(
    v.array(
      v.object({
        title: v.string(),
        description: v.string(),
      }),
    ),
  ),
  learningOutcomes: v.optional(
    v.array(
      v.object({
        icon: v.string(),
        title: v.string(),
      }),
    ),
  ),
  allocation: v.optional(
    v.array(
      v.object({
        topic: v.string(),
        hours: v.number(),
      }),
    ),
  ),
  fileUrl: v.optional(v.string()),
  worksheetDescription: v.optional(v.string()),
  targetAudience: v.optional(v.array(v.string())),
  emotionalHook: v.optional(v.string()),
  painPoints: v.optional(v.array(v.string())),
  outcomes: v.optional(v.array(v.string())),
  whyDifferent: v.optional(v.array(v.string())),
  lifecycleStatus: v.optional(CourseLifecycleStatus),
  usesBatches: v.optional(v.boolean()),
};

const courseBatchPatchValidator = {
  label: v.optional(v.string()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
  daysOfWeek: v.optional(v.array(v.string())),
  capacity: v.optional(v.number()),
  lifecycleStatus: v.optional(CourseLifecycleStatus),
  sortOrder: v.optional(v.number()),
};

function hasText(value: string | undefined | null) {
  return typeof value === "string" && value.trim().length > 0;
}

function toSortableTimestamp(value?: string): number {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function hasRequiredSchedule(course: {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
}) {
  return (
    hasText(course.startDate) &&
    hasText(course.endDate) &&
    hasText(course.startTime) &&
    hasText(course.endTime) &&
    Array.isArray(course.daysOfWeek) &&
    course.daysOfWeek.length > 0
  );
}

function isBatchEnabledType(type?: AdminCourseType) {
  return (
    type === "certificate" ||
    type === "diploma" ||
    type === "internship" ||
    type === "masterclass" ||
    type === "resume-studio"
  );
}

async function assertPublishedBatchBackedCourseHasBatch(
  ctx: QueryCtx | MutationCtx,
  courseId: Id<"courses">,
): Promise<AdminCourseFailure | null> {
  const batches = await ctx.db
    .query("courseBatches")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .collect();
  const batch = batches.find(
    (row) =>
      normalizeCourseLifecycleStatus(row.lifecycleStatus) === "published",
  );

  if (!batch) {
    return adminCourseFailure(
      "Add at least one published batch before publishing this course.",
    );
  }

  return null;
}

function validateBatchPatch(batch: {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
  capacity?: number;
}): AdminCourseFailure | null {
  if (!hasRequiredSchedule(batch)) {
    return adminCourseFailure(
      "Batch start/end date, time, and days of week are required.",
    );
  }
  if (!Number.isFinite(batch.capacity) || (batch.capacity ?? 0) < 0) {
    return adminCourseFailure("Batch capacity must be zero or greater.");
  }

  return null;
}

type AdminCourseType =
  | "certificate"
  | "internship"
  | "diploma"
  | "pre-recorded"
  | "masterclass"
  | "therapy"
  | "supervised"
  | "resume-studio"
  | "worksheet";

type OfferDiscountType = "percentage" | "fixedPrice" | "flatOff";

type CourseOfferPatch = {
  name: string;
  discount?: number;
  discountType?: OfferDiscountType;
  discountValue?: number;
};

function validateOffer(
  offer?: CourseOfferPatch | null,
): AdminCourseFailure | null {
  if (!offer) {
    return null;
  }

  const discountType = offer.discountType ?? "percentage";
  const discountValue =
    typeof offer.discountValue === "number"
      ? offer.discountValue
      : offer.discount;

  if (discountValue === undefined) {
    return adminCourseFailure("Offer discount value is required");
  }

  if (
    !Number.isFinite(discountValue) ||
    discountValue < 0 ||
    (discountType === "percentage" && discountValue > 100)
  ) {
    return adminCourseFailure(
      discountType === "percentage"
        ? "Percentage discount must be a number between 0 and 100"
        : "Offer amount must be a number greater than or equal to 0",
    );
  }

  return null;
}

type BatchMigrationSupportedType =
  (typeof BATCH_MIGRATION_SUPPORTED_TYPES)[number];

type BatchMigrationCourseGroup = {
  courses: Doc<"courses">[];
  key: string;
  name: string;
  type: BatchMigrationSupportedType;
};

type BatchMigrationDryRunGroup = {
  canonicalCourseId: Id<"courses">;
  courseIds: Id<"courses">[];
  estimatedReviewCount: number;
  estimatedEnrollmentCount: number;
  key: string;
  legacyRows: Array<{
    courseId: Id<"courses">;
    endDate?: string;
    label: string;
    lifecycleStatus?: "draft" | "published" | "archived";
    startDate?: string;
  }>;
  name: string;
  type: BatchMigrationSupportedType;
};

type BatchMigrationAmbiguousGroup = {
  courseIds: Id<"courses">[];
  key: string;
  mismatchFields: string[];
  name: string;
  reason: string;
  type: BatchMigrationSupportedType;
};

type BatchMigrationDryRunResult = {
  ambiguousGroups: BatchMigrationAmbiguousGroup[];
  eligibleGroupCount: number;
  estimatedAffectedCourses: number;
  estimatedAffectedEnrollments: number;
  estimatedAffectedReviews: number;
  supportedTypes: BatchMigrationSupportedType[];
  migratableGroups: BatchMigrationDryRunGroup[];
};

type LegacyInternshipArchiveCandidate = {
  courseId: Id<"courses">;
  name: string;
  code?: string;
  duration?: string;
  lifecycleStatus: "draft" | "published" | "archived";
  enrollmentCount: number;
  campaignCount: number;
  reason: string;
};

type LegacyInternshipArchivePreview = {
  candidates: LegacyInternshipArchiveCandidate[];
  candidateCount: number;
  estimatedAffectedEnrollments: number;
  estimatedCampaignReferences: number;
};

function isBatchMigrationSupportedType(
  type?: AdminCourseType,
): type is BatchMigrationSupportedType {
  return BATCH_MIGRATION_SUPPORTED_TYPES.includes(
    type as BatchMigrationSupportedType,
  );
}

function stableSort(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map((item) => stableSort(item))
      .sort((left, right) =>
        JSON.stringify(left).localeCompare(JSON.stringify(right)),
      );
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stableSort(nested)]),
    );
  }

  return value;
}

function normalizeComparableValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === undefined) {
    return "";
  }

  return JSON.stringify(stableSort(value));
}

function getCourseSharedContentComparable(course: Doc<"courses">) {
  return {
    allocation: course.allocation ?? [],
    bogo: course.bogo ?? null,
    code: course.code ?? "",
    content: course.content ?? "",
    description: course.description ?? "",
    duration: course.duration ?? "",
    emotionalHook: course.emotionalHook ?? "",
    fileUrl: course.fileUrl ?? "",
    imageUrls: course.imageUrls ?? [],
    learningOutcomes: course.learningOutcomes ?? [],
    modules: course.modules ?? [],
    offer: course.offer ?? null,
    outcomes: course.outcomes ?? [],
    painPoints: course.painPoints ?? [],
    prerequisites: course.prerequisites ?? "",
    price: course.price ?? 0,
    targetAudience: course.targetAudience ?? [],
    worksheetDescription: course.worksheetDescription ?? "",
    whyDifferent: course.whyDifferent ?? [],
  };
}

function getLegacyInternshipPlanSignal(course: Doc<"courses">) {
  if (course.type !== "internship" || course.usesBatches) {
    return null;
  }

  const searchableText = [
    course.name ?? "",
    course.code ?? "",
    course.duration ?? "",
    course.description ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (
    searchableText.includes("120") ||
    searchableText.includes("120hr") ||
    searchableText.includes("120 hour") ||
    searchableText.includes("2 week")
  ) {
    return "Legacy 120-hour internship signal";
  }

  if (
    searchableText.includes("240") ||
    searchableText.includes("240hr") ||
    searchableText.includes("240 hour") ||
    searchableText.includes("4 week")
  ) {
    return "Legacy 240-hour internship signal";
  }

  return null;
}

function getCourseSharedContentSignature(course: Doc<"courses">) {
  return normalizeComparableValue(getCourseSharedContentComparable(course));
}

function getSharedContentMismatchFields(courses: Doc<"courses">[]) {
  const fields = Object.keys(getCourseSharedContentComparable(courses[0]!));
  return fields.filter((field) => {
    const baseline = normalizeComparableValue(
      getCourseSharedContentComparable(courses[0]!)[
        field as keyof ReturnType<typeof getCourseSharedContentComparable>
      ],
    );
    return courses.some(
      (course) =>
        normalizeComparableValue(
          getCourseSharedContentComparable(course)[
            field as keyof ReturnType<typeof getCourseSharedContentComparable>
          ],
        ) !== baseline,
    );
  });
}

function isPublishedLikeCourse(course: Doc<"courses">) {
  return (course.lifecycleStatus ?? "published") === "published";
}

function sortBatchMigrationCourses(courses: Doc<"courses">[]) {
  return [...courses].sort((left, right) => {
    const leftPublished = isPublishedLikeCourse(left) ? 0 : 1;
    const rightPublished = isPublishedLikeCourse(right) ? 0 : 1;
    if (leftPublished !== rightPublished) {
      return leftPublished - rightPublished;
    }

    return left._creationTime - right._creationTime;
  });
}

function getDefaultMigratedBatchLabel(course: Doc<"courses">) {
  if (hasText(course.startDate) && hasText(course.endDate)) {
    return course.startDate === course.endDate
      ? course.startDate!
      : `${course.startDate} to ${course.endDate}`;
  }

  return course.name;
}

async function listBatchMigrationCandidateGroups(
  ctx: QueryCtx | MutationCtx,
): Promise<BatchMigrationCourseGroup[]> {
  const courses = await ctx.db.query("courses").collect();
  const grouped = new Map<string, Doc<"courses">[]>();

  for (const course of courses) {
    if (
      !isBatchMigrationSupportedType(course.type) ||
      course.mergedIntoCourseId ||
      course.usesBatches
    ) {
      continue;
    }

    const key = `${course.type}::${course.name.trim()}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.push(course);
    } else {
      grouped.set(key, [course]);
    }
  }

  return Array.from(grouped.entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([key, rows]) => ({
      courses: sortBatchMigrationCourses(rows),
      key,
      name: rows[0]!.name,
      type: rows[0]!.type as BatchMigrationSupportedType,
    }));
}

async function countReviewsForCourses(
  ctx: QueryCtx | MutationCtx,
  courseIds: Id<"courses">[],
) {
  let total = 0;
  for (const courseId of courseIds) {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_course", (q) => q.eq("course", courseId))
      .collect();
    total += reviews.length;
  }
  return total;
}

async function countEnrollmentsForCourses(
  ctx: QueryCtx | MutationCtx,
  courseIds: Id<"courses">[],
) {
  let total = 0;
  for (const courseId of courseIds) {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();
    total += enrollments.length;
  }
  return total;
}

async function buildBatchMigrationDryRun(
  ctx: QueryCtx | MutationCtx,
): Promise<BatchMigrationDryRunResult> {
  const candidateGroups = await listBatchMigrationCandidateGroups(ctx);
  const migratableGroups: BatchMigrationDryRunGroup[] = [];
  const ambiguousGroups: BatchMigrationAmbiguousGroup[] = [];

  for (const group of candidateGroups) {
    const missingScheduleRows = group.courses.filter(
      (course) => !hasRequiredSchedule(course),
    );
    if (missingScheduleRows.length > 0) {
      ambiguousGroups.push({
        courseIds: group.courses.map((course) => course._id),
        key: group.key,
        mismatchFields: [
          "startDate",
          "endDate",
          "startTime",
          "endTime",
          "daysOfWeek",
        ],
        name: group.name,
        reason:
          "One or more rows are missing schedule fields required to create batches.",
        type: group.type,
      });
      continue;
    }

    const uniqueSignatures = new Set(
      group.courses.map((course) => getCourseSharedContentSignature(course)),
    );

    if (uniqueSignatures.size !== 1) {
      ambiguousGroups.push({
        courseIds: group.courses.map((course) => course._id),
        key: group.key,
        mismatchFields: getSharedContentMismatchFields(group.courses),
        name: group.name,
        reason:
          "Rows with the same course name/type do not share the same canonical content fields.",
        type: group.type,
      });
      continue;
    }

    const canonical = group.courses[0]!;
    const courseIds = group.courses.map((course) => course._id);
    migratableGroups.push({
      canonicalCourseId: canonical._id,
      courseIds,
      estimatedEnrollmentCount: await countEnrollmentsForCourses(
        ctx,
        courseIds,
      ),
      estimatedReviewCount: await countReviewsForCourses(ctx, courseIds),
      key: group.key,
      legacyRows: group.courses.map((course) => ({
        courseId: course._id,
        endDate: course.endDate,
        label: getDefaultMigratedBatchLabel(course),
        lifecycleStatus: course.lifecycleStatus,
        startDate: course.startDate,
      })),
      name: group.name,
      type: group.type,
    });
  }

  return {
    ambiguousGroups,
    eligibleGroupCount: migratableGroups.length,
    estimatedAffectedCourses: migratableGroups.reduce(
      (total, group) => total + group.courseIds.length,
      0,
    ),
    estimatedAffectedEnrollments: migratableGroups.reduce(
      (total, group) => total + group.estimatedEnrollmentCount,
      0,
    ),
    estimatedAffectedReviews: migratableGroups.reduce(
      (total, group) => total + group.estimatedReviewCount,
      0,
    ),
    supportedTypes: [...BATCH_MIGRATION_SUPPORTED_TYPES],
    migratableGroups,
  };
}

function countCampaignReferencesForCourse(
  bundleCampaigns: Doc<"bundleCampaigns">[],
  courseId: Id<"courses">,
) {
  return bundleCampaigns.filter((campaign) =>
    campaign.eligibleCourseIds.some(
      (eligibleCourseId) => String(eligibleCourseId) === String(courseId),
    ),
  ).length;
}

async function buildLegacyInternshipArchivePreview(
  ctx: QueryCtx | MutationCtx,
): Promise<LegacyInternshipArchivePreview> {
  const [courses, bundleCampaigns] = await Promise.all([
    ctx.db.query("courses").collect(),
    ctx.db.query("bundleCampaigns").collect(),
  ]);
  const candidates: LegacyInternshipArchiveCandidate[] = [];

  for (const course of courses) {
    const reason = getLegacyInternshipPlanSignal(course);
    const lifecycleStatus = normalizeCourseLifecycleStatus(
      course.lifecycleStatus,
    );
    if (!reason || lifecycleStatus === "archived") {
      continue;
    }

    const enrollmentCount = await countEnrollmentsForCourses(ctx, [course._id]);
    const campaignCount = countCampaignReferencesForCourse(
      bundleCampaigns,
      course._id,
    );

    candidates.push({
      courseId: course._id,
      name: course.name,
      code: course.code,
      duration: course.duration,
      lifecycleStatus,
      enrollmentCount,
      campaignCount:
        campaignCount + (course.offer || course.bogo?.enabled ? 1 : 0),
      reason,
    });
  }

  candidates.sort((left, right) => {
    const statusOrder = { published: 0, draft: 1, archived: 2 } as const;
    const statusDelta =
      statusOrder[left.lifecycleStatus] - statusOrder[right.lifecycleStatus];
    return statusDelta || left.name.localeCompare(right.name);
  });

  return {
    candidates,
    candidateCount: candidates.length,
    estimatedAffectedEnrollments: candidates.reduce(
      (total, candidate) => total + candidate.enrollmentCount,
      0,
    ),
    estimatedCampaignReferences: candidates.reduce(
      (total, candidate) => total + candidate.campaignCount,
      0,
    ),
  };
}

async function getActiveEnrollmentUsersForCourse(
  ctx: MutationCtx,
  courseId: Id<"courses">,
) {
  const enrollments = await ctx.db
    .query("enrollments")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .collect();

  return Array.from(
    new Set(
      enrollments
        .filter((row) => (row.status ?? "active") === "active")
        .map((row) => row.userId),
    ),
  );
}

type CourseCodeConventionCandidateInput = {
  _id?: Id<"courses">;
  name?: string;
  code?: string;
  type?: AdminCourseType;
  lifecycleStatus?: "draft" | "published" | "archived";
  description?: string;
  content?: string;
  fileUrl?: string;
  worksheetDescription?: string;
  targetAudience?: string[];
};

function getUpperCodePrefix(code?: string) {
  if (typeof code !== "string") {
    return null;
  }

  const normalized = code.trim().toUpperCase();
  return normalized.length >= 2 ? normalized.slice(0, 2) : null;
}

function replaceCodePrefix(code: string, nextPrefix: string) {
  const trimmed = code.trim();
  return `${nextPrefix.toUpperCase()}${trimmed.slice(2)}`;
}

function hasWorksheetOnlyFields(course: {
  fileUrl?: string;
  worksheetDescription?: string;
  targetAudience?: string[];
}) {
  return (
    hasText(course.fileUrl) ||
    hasText(course.worksheetDescription) ||
    (Array.isArray(course.targetAudience) && course.targetAudience.length > 0)
  );
}

function hasMasterclassWorkshopSignal(course: {
  type?: AdminCourseType;
  name?: string;
  description?: string;
  content?: string;
}) {
  if (course.type === "masterclass") {
    return true;
  }

  const searchableText = [
    course.name ?? "",
    course.description ?? "",
    course.content ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return /\b(masterclass|master class|workshop)\b/.test(searchableText);
}

function isMasterclassRepairEligible(
  course: CourseCodeConventionCandidateInput,
) {
  if (
    hasText(course.code) &&
    getUpperCodePrefix(course.code) === "MC" &&
    course.type !== "masterclass"
  ) {
    return true;
  }

  return (
    hasText(course.code) &&
    getUpperCodePrefix(course.code) === "WS" &&
    !hasWorksheetOnlyFields(course) &&
    hasMasterclassWorkshopSignal(course)
  );
}

function getMasterclassRepairCandidate(
  course: CourseCodeConventionCandidateInput & {
    _id: Id<"courses">;
    name: string;
    code: string;
  },
) {
  if (!isMasterclassRepairEligible(course)) {
    return null;
  }

  const codePrefix = getUpperCodePrefix(course.code);
  const suggestedCode =
    codePrefix === "MC"
      ? course.code.trim()
      : replaceCodePrefix(course.code, "MC");

  return {
    courseId: course._id,
    name: course.name,
    lifecycleStatus: normalizeCourseLifecycleStatus(course.lifecycleStatus),
    currentType: course.type ?? null,
    suggestedType: "masterclass" as const,
    currentCode: course.code.trim(),
    suggestedCode,
    reason:
      codePrefix === "MC"
        ? "Course uses the masterclass/workshop `MC` prefix but is not stored as masterclass."
        : "Course uses the legacy workshop `WS` prefix but matches masterclass/workshop signals and has no worksheet-only fields.",
  };
}

function validatePublishedCourseCodeConvention(course: {
  type?: AdminCourseType;
  code?: string;
}): AdminCourseFailure | null {
  const codePrefix = getUpperCodePrefix(course.code);

  if (course.type === "masterclass" && codePrefix !== "MC") {
    return adminCourseFailure(
      "Masterclass and workshop course codes must start with MC before publishing.",
    );
  }

  if (course.type === "worksheet" && codePrefix !== "WS") {
    return adminCourseFailure(
      "Worksheet course codes must start with WS before publishing.",
    );
  }

  if (codePrefix === "WS" && course.type !== "worksheet") {
    return adminCourseFailure("Only worksheet course codes can start with WS.");
  }

  if (codePrefix === "MC" && course.type !== "masterclass") {
    return adminCourseFailure(
      "Only masterclass and workshop course codes can start with MC.",
    );
  }

  return null;
}

function validatePublishableCourse(course: {
  name?: string;
  code?: string;
  type?: AdminCourseType;
  usesBatches?: boolean;
  content?: string;
  description?: string;
  learningOutcomes?: Array<{ icon: string; title: string }>;
  allocation?: Array<{ topic: string; hours: number }>;
  duration?: string;
  sessions?: number;
  fileUrl?: string;
  worksheetDescription?: string;
  targetAudience?: string[];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
}): AdminCourseFailure | null {
  if (!hasText(course.name)) {
    return adminCourseFailure("Course name is required before publishing");
  }
  if (!hasText(course.code)) {
    return adminCourseFailure("Course code is required before publishing");
  }
  if (!course.type) {
    return adminCourseFailure("Course type is required before publishing");
  }
  const codeError = validatePublishedCourseCodeConvention(course);
  if (codeError) {
    return codeError;
  }
  if (!hasText(course.description)) {
    return adminCourseFailure(
      "Course description is required before publishing",
    );
  }

  switch (course.type) {
    case "certificate":
    case "diploma":
    case "masterclass":
    case "resume-studio": {
      if (
        !Array.isArray(course.learningOutcomes) ||
        course.learningOutcomes.length === 0
      ) {
        return adminCourseFailure(
          "Learning outcomes are required before publishing",
        );
      }
      if (!course.usesBatches && !hasRequiredSchedule(course)) {
        return adminCourseFailure(
          "Start/end date, time, and days of week are required before publishing",
        );
      }
      break;
    }

    case "internship": {
      if (
        !Array.isArray(course.learningOutcomes) ||
        course.learningOutcomes.length === 0
      ) {
        return adminCourseFailure(
          "Learning outcomes are required before publishing",
        );
      }
      if (!Array.isArray(course.allocation) || course.allocation.length === 0) {
        return adminCourseFailure(
          "Internship allocation is required before publishing",
        );
      }
      if (!course.usesBatches && !hasText(course.duration)) {
        return adminCourseFailure(
          "Internship duration is required before publishing",
        );
      }
      if (!course.usesBatches && !hasRequiredSchedule(course)) {
        return adminCourseFailure(
          "Start/end date, time, and days of week are required before publishing",
        );
      }
      break;
    }

    case "pre-recorded": {
      if (
        !Array.isArray(course.learningOutcomes) ||
        course.learningOutcomes.length === 0
      ) {
        return adminCourseFailure(
          "Learning outcomes are required before publishing",
        );
      }
      break;
    }

    case "therapy":
    case "supervised": {
      if (typeof course.sessions !== "number" || course.sessions <= 0) {
        return adminCourseFailure("Sessions are required before publishing");
      }
      break;
    }

    case "worksheet": {
      if (!hasText(course.fileUrl)) {
        return adminCourseFailure(
          "Worksheet file URL is required before publishing",
        );
      }
      if (!hasText(course.worksheetDescription)) {
        return adminCourseFailure(
          "Worksheet description is required before publishing",
        );
      }
      if (
        !Array.isArray(course.targetAudience) ||
        course.targetAudience.length === 0
      ) {
        return adminCourseFailure(
          "Worksheet target audience is required before publishing",
        );
      }
      break;
    }

    default:
      break;
  }

  return null;
}

function getSuggestedCourseType(course: CourseCodeConventionCandidateInput) {
  const codePrefix = getUpperCodePrefix(course.code);

  if (isMasterclassRepairEligible(course)) {
    return null;
  }

  if (codePrefix === "IN" && course.type !== "internship") {
    return {
      suggestedType: "internship" as const,
      reason: "Course code uses the internship prefix `IN`.",
    };
  }

  if (codePrefix === "PR" && course.type !== "pre-recorded") {
    return {
      suggestedType: "pre-recorded" as const,
      reason: "Course code uses the pre-recorded prefix `PR`.",
    };
  }

  if (codePrefix === "MC" && course.type !== "masterclass") {
    return {
      suggestedType: "masterclass" as const,
      reason: "Course code uses the masterclass/workshop prefix `MC`.",
    };
  }

  if (codePrefix === "WS" && course.type !== "worksheet") {
    return {
      suggestedType: "worksheet" as const,
      reason: "Course code uses the worksheet prefix `WS`.",
    };
  }

  if (codePrefix === "DP" && course.type !== "diploma") {
    return {
      suggestedType: "diploma" as const,
      reason: "Course code uses the diploma prefix `DP`.",
    };
  }

  if (codePrefix === "CC" && course.type !== "certificate") {
    return {
      suggestedType: "certificate" as const,
      reason: "Course code uses the certificate prefix `CC`.",
    };
  }

  return null;
}

export const listCourses = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(CourseType),
    lifecycleStatus: v.optional(CourseLifecycleStatus),
    limit: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal("name"),
        v.literal("price"),
        v.literal("startDate"),
        v.literal("updatedAt"),
        v.literal("createdAt"),
      ),
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 200, 500);
    const scanLimit = Math.min(Math.max(limit * 5, 500), 2000);
    const useLifecycleIndexes =
      !!args.lifecycleStatus && args.lifecycleStatus !== "published";
    let isTypeScopedQuery = false;

    let courses: any[];

    if (args.lifecycleStatus === "published") {
      const publishedScanLimit = Math.min(limit * 2, scanLimit);
      const publishedIndexQuery = args.type
        ? ctx.db
            .query("courses")
            .withIndex("by_type_and_lifecycleStatus", (q) =>
              q.eq("type", args.type!).eq("lifecycleStatus", "published"),
            )
        : ctx.db
            .query("courses")
            .withIndex("by_lifecycleStatus", (q) =>
              q.eq("lifecycleStatus", "published"),
            );
      isTypeScopedQuery = !!args.type;

      const [publishedViaIndex, publishedLegacy] = await Promise.all([
        publishedIndexQuery.order("desc").take(publishedScanLimit),
        args.type
          ? ctx.db
              .query("courses")
              .withIndex("by_type_and_lifecycleStatus", (q) =>
                q.eq("type", args.type!).eq("lifecycleStatus", undefined),
              )
              .order("desc")
              .take(publishedScanLimit)
          : ctx.db
              .query("courses")
              .withIndex("by_lifecycleStatus", (q) =>
                q.eq("lifecycleStatus", undefined),
              )
              .order("desc")
              .take(publishedScanLimit),
      ]);
      const mergedMap = new Map<string, any>();
      for (const c of publishedViaIndex) {
        mergedMap.set(String(c._id), c);
      }
      for (const c of publishedLegacy) {
        if (
          (!args.type || c.type === args.type) &&
          !mergedMap.has(String(c._id))
        ) {
          mergedMap.set(String(c._id), c);
        }
      }
      courses = Array.from(mergedMap.values());
    } else {
      const baseQuery =
        args.type && useLifecycleIndexes
          ? ctx.db
              .query("courses")
              .withIndex("by_type_and_lifecycleStatus", (q) =>
                q
                  .eq("type", args.type!)
                  .eq("lifecycleStatus", args.lifecycleStatus!),
              )
          : useLifecycleIndexes
            ? ctx.db
                .query("courses")
                .withIndex("by_lifecycleStatus", (q) =>
                  q.eq("lifecycleStatus", args.lifecycleStatus!),
                )
            : args.type
              ? ctx.db
                  .query("courses")
                  .withIndex("by_type", (q) => q.eq("type", args.type!))
              : ctx.db.query("courses");
      isTypeScopedQuery = !!args.type;

      courses = await baseQuery.order("desc").take(scanLimit);
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      courses = courses.filter((course) => {
        const fields = [
          course.name,
          course.code,
          course.description ?? "",
          course.type ?? "",
          course.offer?.name ?? "",
          course.bogo?.label ?? "",
        ];
        return fields.some((field) => field.toLowerCase().includes(search));
      });
    }

    if (args.type && !isTypeScopedQuery) {
      courses = courses.filter((course) => course.type === args.type);
    }

    if (args.lifecycleStatus && !useLifecycleIndexes) {
      courses = courses.filter(
        (course) =>
          normalizeCourseLifecycleStatus(course.lifecycleStatus) ===
          args.lifecycleStatus,
      );
    }

    courses = courses.filter((course) => !course.mergedIntoCourseId);

    const sortOrder = args.sortOrder ?? "desc";
    const multiplier = sortOrder === "asc" ? 1 : -1;

    courses.sort((a, b) => {
      const sortBy = args.sortBy ?? "createdAt";

      if (sortBy === "name") {
        return a.name.localeCompare(b.name) * multiplier;
      }
      if (sortBy === "price") {
        return ((a.price ?? 0) - (b.price ?? 0)) * multiplier;
      }
      if (sortBy === "startDate") {
        const aTime = toSortableTimestamp(a.startDate);
        const bTime = toSortableTimestamp(b.startDate);
        return (aTime - bTime) * multiplier;
      }
      if (sortBy === "updatedAt") {
        return (
          ((a.updatedAt ?? a._creationTime) -
            (b.updatedAt ?? b._creationTime)) *
          multiplier
        );
      }

      return (a._creationTime - b._creationTime) * multiplier;
    });

    return courses.slice(0, limit);
  },
});

export const listCourseTypeIssues = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    issues: v.array(
      v.object({
        courseId: v.id("courses"),
        name: v.string(),
        code: v.union(v.string(), v.null()),
        lifecycleStatus: v.union(CourseLifecycleStatus, v.null()),
        currentType: v.union(CourseType, v.null()),
        suggestedType: CourseType,
        reason: v.string(),
      }),
    ),
    scanned: v.number(),
    truncated: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const courses = await ctx.db
      .query("courses")
      .order("desc")
      .take(COURSE_INTEGRITY_SCAN_LIMIT + 1);
    const scannedCourses = courses.slice(0, COURSE_INTEGRITY_SCAN_LIMIT);
    const issues = scannedCourses
      .map((course) => {
        const suggestion = getSuggestedCourseType(course);
        if (!suggestion) {
          return null;
        }

        return {
          courseId: course._id,
          name: course.name,
          code: course.code ?? null,
          lifecycleStatus: normalizeCourseLifecycleStatus(
            course.lifecycleStatus,
          ),
          currentType: course.type ?? null,
          suggestedType: suggestion.suggestedType,
          reason: suggestion.reason,
        };
      })
      .filter((issue): issue is NonNullable<typeof issue> => issue !== null)
      .sort((a, b) => {
        if (a.currentType === null && b.currentType !== null) return -1;
        if (a.currentType !== null && b.currentType === null) return 1;
        return a.name.localeCompare(b.name);
      });

    return {
      issues: issues.slice(0, args.limit ?? 100),
      scanned: scannedCourses.length,
      truncated: courses.length > COURSE_INTEGRITY_SCAN_LIMIT,
    };
  },
});

export const listMasterclassCodeRepairCandidates = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    candidates: v.array(
      v.object({
        courseId: v.id("courses"),
        name: v.string(),
        lifecycleStatus: CourseLifecycleStatus,
        currentType: v.union(CourseType, v.null()),
        suggestedType: v.literal("masterclass"),
        currentCode: v.string(),
        suggestedCode: v.string(),
        reason: v.string(),
      }),
    ),
    scanned: v.number(),
    truncated: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const lifecycleOrder = {
      published: 0,
      draft: 1,
      archived: 2,
    } as const;
    const courses = await ctx.db
      .query("courses")
      .order("desc")
      .take(COURSE_INTEGRITY_SCAN_LIMIT + 1);
    const scannedCourses = courses.slice(0, COURSE_INTEGRITY_SCAN_LIMIT);
    const candidates = scannedCourses
      .map((course) => {
        if (!hasText(course.code)) {
          return null;
        }

        return getMasterclassRepairCandidate({
          ...course,
          code: course.code,
        });
      })
      .filter(
        (candidate): candidate is NonNullable<typeof candidate> =>
          candidate !== null,
      )
      .sort((a, b) => {
        const lifecycleDelta =
          lifecycleOrder[a.lifecycleStatus] - lifecycleOrder[b.lifecycleStatus];
        return lifecycleDelta || a.name.localeCompare(b.name);
      });

    return {
      candidates: candidates.slice(0, args.limit ?? 100),
      scanned: scannedCourses.length,
      truncated: courses.length > COURSE_INTEGRITY_SCAN_LIMIT,
    };
  },
});

export const getCourseById = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.courseId);
  },
});

export const listCourseBatches = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const batches = await ctx.db
      .query("courseBatches")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();

    return batches.sort((left, right) => {
      const sortDelta = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
      if (sortDelta !== 0) {
        return sortDelta;
      }
      const startDelta =
        new Date(left.startDate).getTime() -
        new Date(right.startDate).getTime();
      if (Number.isFinite(startDelta) && startDelta !== 0) {
        return startDelta;
      }
      return left._creationTime - right._creationTime;
    });
  },
});

export const createBatch = mutation({
  args: {
    courseId: v.id("courses"),
    data: v.object(courseBatchPatchValidator),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return adminCourseFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }
    if (!isBatchEnabledType(course.type)) {
      return adminCourseFailure("This course type does not support batches.");
    }

    const batchError = validateBatchPatch(args.data);
    if (batchError) {
      return batchError;
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("courseBatches")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();

    const batchId = await ctx.db.insert("courseBatches", {
      courseId: args.courseId,
      label: args.data.label?.trim() || args.data.startDate || "Upcoming batch",
      startDate: args.data.startDate!,
      endDate: args.data.endDate!,
      startTime: args.data.startTime!,
      endTime: args.data.endTime!,
      daysOfWeek: args.data.daysOfWeek ?? [],
      capacity: args.data.capacity ?? 0,
      enrolledUsers: [],
      lifecycleStatus: args.data.lifecycleStatus ?? "draft",
      sortOrder: args.data.sortOrder ?? existing.length,
      createdByAdminId: admin.userId,
      updatedByAdminId: admin.userId,
      updatedAt: now,
    });

    if (!course.usesBatches) {
      await ctx.db.patch(args.courseId, {
        usesBatches: true,
        updatedByAdminId: admin.userId,
        updatedAt: now,
      });
    }

    const batch = await ctx.db.get(batchId);
    if (!batch) {
      return adminCourseFailure(
        "Batch could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course_batch.create",
      entityType: "course_batch",
      entityId: String(batchId),
      after: batch,
      metadata: {
        courseId: String(args.courseId),
      },
    });

    return convexSuccess({ batch });
  },
});

export const updateBatch = mutation({
  args: {
    batchId: v.id("courseBatches"),
    patch: v.object(courseBatchPatchValidator),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.batchId);
    if (!existing) {
      return adminCourseFailure(
        "Batch not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const next = {
      ...existing,
      ...args.patch,
    };
    const batchError = validateBatchPatch(next);
    if (batchError) {
      return batchError;
    }

    const patch = {
      ...args.patch,
      label:
        args.patch.label !== undefined
          ? args.patch.label.trim() || next.startDate
          : undefined,
      updatedByAdminId: admin.userId,
      updatedAt: Date.now(),
    };

    await ctx.db.patch(args.batchId, patch);
    const updated = await ctx.db.get(args.batchId);
    if (!updated) {
      return adminCourseFailure(
        "Batch could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course_batch.update",
      entityType: "course_batch",
      entityId: String(args.batchId),
      before: existing,
      after: updated,
    });

    return convexSuccess({ batch: updated });
  },
});

export const duplicateBatch = mutation({
  args: {
    batchId: v.id("courseBatches"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.batchId);
    if (!existing) {
      return adminCourseFailure(
        "Batch not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const siblings = await ctx.db
      .query("courseBatches")
      .withIndex("by_courseId", (q) => q.eq("courseId", existing.courseId))
      .collect();
    const now = Date.now();
    const duplicatedId = await ctx.db.insert("courseBatches", {
      courseId: existing.courseId,
      label: `${existing.label} copy`,
      startDate: existing.startDate,
      endDate: existing.endDate,
      startTime: existing.startTime,
      endTime: existing.endTime,
      daysOfWeek: existing.daysOfWeek,
      capacity: existing.capacity,
      enrolledUsers: [],
      lifecycleStatus: "draft",
      sortOrder: siblings.length,
      createdByAdminId: admin.userId,
      updatedByAdminId: admin.userId,
      updatedAt: now,
    });
    const duplicated = await ctx.db.get(duplicatedId);
    if (!duplicated) {
      return adminCourseFailure(
        "Batch could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course_batch.duplicate",
      entityType: "course_batch",
      entityId: String(duplicatedId),
      after: duplicated,
      metadata: {
        sourceBatchId: String(args.batchId),
      },
    });

    return convexSuccess({ batch: duplicated });
  },
});

export const archiveBatch = mutation({
  args: {
    batchId: v.id("courseBatches"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.batchId);
    if (!existing) {
      return adminCourseFailure(
        "Batch not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await ctx.db.patch(args.batchId, {
      lifecycleStatus: "archived",
      updatedByAdminId: admin.userId,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get(args.batchId);
    if (!updated) {
      return adminCourseFailure(
        "Batch could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course_batch.archive",
      entityType: "course_batch",
      entityId: String(args.batchId),
      before: existing,
      after: updated,
    });

    return convexSuccess({ batch: updated });
  },
});

export const reorderBatches = mutation({
  args: {
    courseId: v.id("courses"),
    batchIds: v.array(v.id("courseBatches")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const uniqueIds = Array.from(new Set(args.batchIds.map(String)));

    for (let index = 0; index < uniqueIds.length; index += 1) {
      const batchId = uniqueIds[index] as Id<"courseBatches">;
      const batch = await ctx.db.get(batchId);
      if (!batch || String(batch.courseId) !== String(args.courseId)) {
        return adminCourseFailure(
          "Batch reorder payload contains an invalid batch.",
        );
      }
      await ctx.db.patch(batchId, {
        sortOrder: index,
        updatedByAdminId: admin.userId,
        updatedAt: Date.now(),
      });
    }

    const batches = await ctx.db
      .query("courseBatches")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();
    return convexSuccess({ batches });
  },
});

export const previewBatchBackfillMigration = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await buildBatchMigrationDryRun(ctx);
  },
});

export const previewLegacyInternshipArchive = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await buildLegacyInternshipArchivePreview(ctx);
  },
});

export const applyLegacyInternshipArchive = mutation({
  args: {
    courseIds: v.array(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const preview = await buildLegacyInternshipArchivePreview(ctx);
    const selectedCourseIds = new Set(
      args.courseIds.map((courseId) => String(courseId)),
    );
    const selectedCandidates = preview.candidates.filter((candidate) =>
      selectedCourseIds.has(String(candidate.courseId)),
    );
    if (selectedCandidates.length === 0) {
      return adminCourseFailure(
        "Select at least one legacy internship course to archive.",
      );
    }

    const now = Date.now();
    let archivedCourses = 0;
    let clearedCourseCampaigns = 0;
    let updatedBundleCampaigns = 0;
    const estimatedAffectedEnrollments = selectedCandidates.reduce(
      (total, candidate) => total + candidate.enrollmentCount,
      0,
    );
    const archivedCourseIds = new Set(
      selectedCandidates.map((candidate) => String(candidate.courseId)),
    );

    for (const candidate of selectedCandidates) {
      const course = await ctx.db.get(candidate.courseId);
      if (
        !course ||
        normalizeCourseLifecycleStatus(course.lifecycleStatus) === "archived"
      ) {
        continue;
      }

      await ctx.db.patch(candidate.courseId, {
        lifecycleStatus: "archived",
        offer: undefined,
        bogo: undefined,
        archivedAt: now,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });
      archivedCourses += 1;
      if (course.offer || course.bogo?.enabled) {
        clearedCourseCampaigns += 1;
      }
    }

    const bundleCampaigns = await ctx.db.query("bundleCampaigns").collect();
    for (const campaign of bundleCampaigns) {
      const nextEligibleCourseIds = campaign.eligibleCourseIds.filter(
        (courseId) => !archivedCourseIds.has(String(courseId)),
      );
      if (nextEligibleCourseIds.length === campaign.eligibleCourseIds.length) {
        continue;
      }

      await ctx.db.patch(campaign._id, {
        eligibleCourseIds: nextEligibleCourseIds,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });
      updatedBundleCampaigns += 1;
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "legacy_internship_archive.apply",
      entityType: "course",
      entityId: "legacy-internship-archive",
      metadata: {
        archivedCourses,
        clearedCourseCampaigns,
        estimatedAffectedEnrollments,
        selectedCourseIds: selectedCandidates.map((candidate) =>
          String(candidate.courseId),
        ),
        updatedBundleCampaigns,
      },
    });

    return convexSuccess({
      archivedCourses,
      clearedCourseCampaigns,
      estimatedAffectedEnrollments,
      updatedBundleCampaigns,
    });
  },
});

export const applyBatchBackfillMigration = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    const dryRun = await buildBatchMigrationDryRun(ctx);
    const now = Date.now();
    const sourceToCanonical = new Map<string, Id<"courses">>();
    let createdBatches = 0;
    let movedEnrollments = 0;
    let movedReviews = 0;

    for (const group of dryRun.migratableGroups) {
      const groupCourses = sortBatchMigrationCourses(
        (
          await Promise.all(
            group.courseIds.map((courseId) => ctx.db.get(courseId)),
          )
        ).filter((course): course is Doc<"courses"> => !!course),
      );
      if (groupCourses.length < 2) {
        continue;
      }

      const canonical = groupCourses.find(
        (course) => String(course._id) === String(group.canonicalCourseId),
      );
      if (!canonical) {
        continue;
      }

      const canonicalReviewIds = new Set<Id<"reviews">>(
        canonical.reviews ?? [],
      );

      for (let index = 0; index < groupCourses.length; index += 1) {
        const sourceCourse = groupCourses[index]!;
        sourceToCanonical.set(String(sourceCourse._id), canonical._id);

        let batch = await ctx.db
          .query("courseBatches")
          .withIndex("by_legacySourceCourseId", (q) =>
            q.eq("legacySourceCourseId", sourceCourse._id),
          )
          .first();

        if (!batch) {
          const activeUsers = await getActiveEnrollmentUsersForCourse(
            ctx,
            sourceCourse._id,
          );
          const batchId = await ctx.db.insert("courseBatches", {
            capacity: sourceCourse.capacity ?? 0,
            courseId: canonical._id,
            createdByAdminId: admin.userId,
            daysOfWeek: sourceCourse.daysOfWeek ?? [],
            endDate: sourceCourse.endDate ?? sourceCourse.startDate ?? "",
            endTime: sourceCourse.endTime ?? "23:59",
            enrolledUsers: activeUsers,
            label: getDefaultMigratedBatchLabel(sourceCourse),
            legacySourceCourseId: sourceCourse._id,
            lifecycleStatus: sourceCourse.lifecycleStatus ?? "published",
            sortOrder: index,
            startDate: sourceCourse.startDate ?? sourceCourse.endDate ?? "",
            startTime: sourceCourse.startTime ?? "00:00",
            updatedAt: now,
            updatedByAdminId: admin.userId,
          });
          batch = await ctx.db.get(batchId);
          createdBatches += 1;
        }

        if (!batch) {
          return adminCourseFailure(
            `Failed to create or load migrated batch for course ${sourceCourse._id}.`,
          );
        }

        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_course", (q) => q.eq("course", sourceCourse._id))
          .collect();
        for (const review of reviews) {
          canonicalReviewIds.add(review._id);
          if (String(review.course) !== String(canonical._id)) {
            await ctx.db.patch(review._id, { course: canonical._id });
            movedReviews += 1;
          }
        }

        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_courseId", (q) => q.eq("courseId", sourceCourse._id))
          .collect();
        for (const enrollment of enrollments) {
          if (
            String(enrollment.courseId) === String(canonical._id) &&
            String(enrollment.batchId) === String(batch._id)
          ) {
            continue;
          }

          await ctx.db.patch(enrollment._id, {
            batchDaysOfWeek: batch.daysOfWeek,
            batchEndDate: batch.endDate,
            batchEndTime: batch.endTime,
            batchId: batch._id,
            batchLabel: batch.label,
            batchStartDate: batch.startDate,
            batchStartTime: batch.startTime,
            courseId: canonical._id,
            courseName: `${canonical.name} (${batch.label})`,
            courseType: canonical.type,
          });
          movedEnrollments += 1;
        }

        if (String(sourceCourse._id) === String(canonical._id)) {
          continue;
        } else {
          await ctx.db.patch(sourceCourse._id, {
            mergedIntoBatchId: batch._id,
            mergedIntoCourseId: canonical._id,
            reviews: [],
            updatedAt: now,
            updatedByAdminId: admin.userId,
          });
        }
      }

      await ctx.db.patch(canonical._id, {
        capacity: undefined,
        daysOfWeek: undefined,
        endDate: undefined,
        endTime: undefined,
        enrolledUsers: [],
        reviews: Array.from(canonicalReviewIds),
        startDate: undefined,
        startTime: undefined,
        updatedAt: now,
        updatedByAdminId: admin.userId,
        usesBatches: true,
      });
    }

    const campaigns = await ctx.db.query("bundleCampaigns").collect();
    let updatedBundleCampaigns = 0;
    for (const campaign of campaigns) {
      const rewrittenEligibleCourseIds = Array.from(
        new Set(
          campaign.eligibleCourseIds.map(
            (courseId) => sourceToCanonical.get(String(courseId)) ?? courseId,
          ),
        ),
      );

      const changed =
        rewrittenEligibleCourseIds.length !==
          campaign.eligibleCourseIds.length ||
        rewrittenEligibleCourseIds.some(
          (courseId, index) =>
            String(courseId) !== String(campaign.eligibleCourseIds[index]),
        );

      if (!changed) {
        continue;
      }

      await ctx.db.patch(campaign._id, {
        eligibleCourseIds: rewrittenEligibleCourseIds,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });
      updatedBundleCampaigns += 1;
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course_batch_migration.apply",
      entityType: "course",
      entityId: "batch-backfill",
      metadata: {
        ambiguousGroupCount: dryRun.ambiguousGroups.length,
        createdBatches,
        eligibleGroupCount: dryRun.eligibleGroupCount,
        movedEnrollments,
        movedReviews,
        updatedBundleCampaigns,
      },
    });

    return convexSuccess({
      ambiguousGroups: dryRun.ambiguousGroups,
      createdBatches,
      eligibleGroupCount: dryRun.eligibleGroupCount,
      movedEnrollments,
      movedReviews,
      updatedBundleCampaigns,
    });
  },
});

export const createCourse = mutation({
  args: {
    name: v.string(),
    type: v.optional(CourseType),
    lifecycleStatus: v.optional(CourseLifecycleStatus),
    data: v.optional(v.object(coursePatchValidator)),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const now = Date.now();
    const today = new Date().toISOString().split("T")[0];

    const lifecycleStatus = args.lifecycleStatus ?? "draft";
    const generatedCode = `CRS-${now.toString(36).toUpperCase()}-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 6)
      .toUpperCase()}`;
    const code = args.data?.code || generatedCode;
    const type = args.type ?? args.data?.type ?? "certificate";
    const usesBatches =
      args.data?.usesBatches ?? isBatchEnabledType(type) ?? false;
    const offerError = validateOffer(args.data?.offer);
    if (offerError) {
      return offerError;
    }

    const payload = {
      ...args.data,
      name: args.name,
      type,
      code,
      price: args.data?.price ?? 0,
      capacity: usesBatches ? undefined : (args.data?.capacity ?? 1),
      enrolledUsers: [],
      startDate: usesBatches ? undefined : (args.data?.startDate ?? today),
      endDate: usesBatches ? undefined : (args.data?.endDate ?? today),
      startTime: usesBatches ? undefined : (args.data?.startTime ?? "00:00"),
      endTime: usesBatches ? undefined : (args.data?.endTime ?? "23:59"),
      daysOfWeek: usesBatches ? undefined : (args.data?.daysOfWeek ?? []),
      content: args.data?.content ?? "",
      reviews: [],
      offer: args.data?.offer ?? undefined,
      bogo: args.data?.bogo ?? undefined,
      usesBatches,
      lifecycleStatus,
      createdByAdminId: admin.userId,
      updatedByAdminId: admin.userId,
      updatedAt: now,
      publishedAt: lifecycleStatus === "published" ? now : undefined,
      archivedAt: lifecycleStatus === "archived" ? now : undefined,
    };

    if (lifecycleStatus === "published") {
      const publishError = validatePublishableCourse(payload);
      if (publishError) {
        return publishError;
      }
      if (payload.usesBatches && isBatchEnabledType(payload.type)) {
        return adminCourseFailure(
          "Save this canonical course as a draft first, then add its batches before publishing.",
        );
      }
    }

    const courseId = await ctx.db.insert("courses", payload);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course.create",
      entityType: "course",
      entityId: String(courseId),
      after: payload,
    });

    return convexSuccess({ courseId });
  },
});

export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    patch: v.object(coursePatchValidator),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.courseId);
    if (!existing) {
      return adminCourseFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const nextLifecycle = args.patch.lifecycleStatus
      ? args.patch.lifecycleStatus
      : normalizeCourseLifecycleStatus(existing.lifecycleStatus);
    const offerError = validateOffer(args.patch.offer);
    if (offerError) {
      return offerError;
    }

    const patch = {
      ...args.patch,
      offer: args.patch.offer === null ? undefined : args.patch.offer,
      bogo: args.patch.bogo === null ? undefined : args.patch.bogo,
      updatedByAdminId: admin.userId,
      updatedAt: Date.now(),
      publishedAt:
        nextLifecycle === "published" &&
        normalizeCourseLifecycleStatus(existing.lifecycleStatus) !== "published"
          ? Date.now()
          : existing.publishedAt,
      archivedAt:
        nextLifecycle === "archived" &&
        normalizeCourseLifecycleStatus(existing.lifecycleStatus) !== "archived"
          ? Date.now()
          : nextLifecycle !== "archived"
            ? undefined
            : existing.archivedAt,
    };

    const preview = {
      ...existing,
      ...patch,
      lifecycleStatus: nextLifecycle,
    };

    if (
      (patch.usesBatches ?? existing.usesBatches) &&
      isBatchEnabledType(preview.type)
    ) {
      patch.capacity = undefined;
      patch.startDate = undefined;
      patch.endDate = undefined;
      patch.startTime = undefined;
      patch.endTime = undefined;
      patch.daysOfWeek = undefined;
    }

    if (nextLifecycle === "published") {
      const publishError = validatePublishableCourse(preview);
      if (publishError) {
        return publishError;
      }
      if (
        (patch.usesBatches ?? existing.usesBatches) &&
        isBatchEnabledType(preview.type)
      ) {
        const batchError = await assertPublishedBatchBackedCourseHasBatch(
          ctx,
          args.courseId,
        );
        if (batchError) {
          return batchError;
        }
      }
    }

    await ctx.db.patch(args.courseId, patch);

    const updated = await ctx.db.get(args.courseId);
    if (!updated) {
      return adminCourseFailure(
        "Course could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course.update",
      entityType: "course",
      entityId: String(args.courseId),
      before: existing,
      after: updated,
    });

    return convexSuccess({ course: updated });
  },
});

export const correctCourseType = mutation({
  args: {
    courseId: v.id("courses"),
    type: CourseType,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.courseId);
    if (!existing) {
      return adminCourseFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const patch = {
      type: args.type,
      updatedByAdminId: admin.userId,
      updatedAt: Date.now(),
    };

    await ctx.db.patch(args.courseId, patch);
    const updated = await ctx.db.get(args.courseId);
    if (!updated) {
      return adminCourseFailure(
        "Course could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course.correct_type",
      entityType: "course",
      entityId: String(args.courseId),
      before: {
        type: existing.type ?? null,
      },
      after: {
        type: args.type,
        reason: args.reason ?? "Manual course type correction",
      },
    });

    return convexSuccess({ course: updated });
  },
});

export const repairMasterclassCourseCodes = mutation({
  args: {
    courseIds: v.array(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const uniqueCourseIds = Array.from(new Set(args.courseIds));
    const courseIdsToProcess = uniqueCourseIds.slice(
      0,
      MASTERCLASS_REPAIR_BATCH_LIMIT,
    );
    let updated = 0;
    let skipped = uniqueCourseIds.length - courseIdsToProcess.length;

    for (const courseId of courseIdsToProcess) {
      const existing = await ctx.db.get(courseId);
      if (!existing || !hasText(existing.code)) {
        skipped += 1;
        continue;
      }

      const candidate = getMasterclassRepairCandidate({
        ...existing,
        code: existing.code,
      });
      if (!candidate) {
        skipped += 1;
        continue;
      }

      const currentLifecycleStatus = normalizeCourseLifecycleStatus(
        existing.lifecycleStatus,
      );
      if (currentLifecycleStatus === "published") {
        const publishError = validatePublishableCourse({
          ...existing,
          type: "masterclass",
          code: candidate.suggestedCode,
        });
        if (publishError) {
          skipped += 1;
          continue;
        }
      }

      const now = Date.now();
      await ctx.db.patch(courseId, {
        type: "masterclass",
        code: candidate.suggestedCode,
        updatedByAdminId: admin.userId,
        updatedAt: now,
      });

      await createAdminAuditLog(ctx, {
        actorAdminId: admin.userId,
        actorEmail: admin.email,
        action: "course.repair_masterclass_code",
        entityType: "course",
        entityId: String(courseId),
        before: {
          type: existing.type ?? null,
          code: existing.code,
        },
        after: {
          type: "masterclass",
          code: candidate.suggestedCode,
          reason: candidate.reason,
        },
      });

      updated += 1;
    }

    return convexSuccess({
      requested: args.courseIds.length,
      processed: courseIdsToProcess.length,
      updated,
      skipped,
    });
  },
});

export const deleteCourse = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.courseId);

    if (!existing) {
      return adminCourseFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const linkedEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();

    if (linkedEnrollment) {
      return adminCourseFailure(
        "Cannot delete a course with enrollments",
        convexResultErrorCode.CONFLICT,
      );
    }

    const linkedReview = await ctx.db
      .query("reviews")
      .withIndex("by_course", (q) => q.eq("course", args.courseId))
      .first();

    if (linkedReview) {
      return adminCourseFailure(
        "Cannot delete a course with reviews",
        convexResultErrorCode.CONFLICT,
      );
    }

    const linkedBatch = await ctx.db
      .query("courseBatches")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();

    if (linkedBatch) {
      const batchEnrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_batchId", (q) => q.eq("batchId", linkedBatch._id))
        .first();
      if (batchEnrollment) {
        return adminCourseFailure(
          "Cannot delete a course with batch enrollments",
          convexResultErrorCode.CONFLICT,
        );
      }

      const batches = await ctx.db
        .query("courseBatches")
        .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
        .collect();
      await Promise.all(batches.map((batch) => ctx.db.delete(batch._id)));
    }

    await ctx.db.delete(args.courseId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course.delete",
      entityType: "course",
      entityId: String(args.courseId),
      before: existing,
    });

    return convexSuccess({});
  },
});

export const transitionCourseLifecycle = mutation({
  args: {
    courseId: v.id("courses"),
    lifecycleStatus: CourseLifecycleStatus,
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.courseId);

    if (!existing) {
      return adminCourseFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const currentStatus = normalizeCourseLifecycleStatus(
      existing.lifecycleStatus,
    );
    if (currentStatus === args.lifecycleStatus) {
      return convexSuccess({ course: existing });
    }

    const now = Date.now();

    if (args.lifecycleStatus === "published") {
      const publishError = validatePublishableCourse(existing);
      if (publishError) {
        return publishError;
      }
      if (existing.usesBatches && isBatchEnabledType(existing.type)) {
        const batchError = await assertPublishedBatchBackedCourseHasBatch(
          ctx,
          args.courseId,
        );
        if (batchError) {
          return batchError;
        }
      }
    }

    await ctx.db.patch(args.courseId, {
      lifecycleStatus: args.lifecycleStatus,
      updatedByAdminId: admin.userId,
      updatedAt: now,
      publishedAt:
        args.lifecycleStatus === "published" ? now : existing.publishedAt,
      archivedAt: args.lifecycleStatus === "archived" ? now : undefined,
    });

    const updated = await ctx.db.get(args.courseId);
    if (!updated) {
      return adminCourseFailure(
        "Course could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course.transition",
      entityType: "course",
      entityId: String(args.courseId),
      before: { lifecycleStatus: currentStatus },
      after: { lifecycleStatus: args.lifecycleStatus },
    });

    return convexSuccess({ course: updated });
  },
});
