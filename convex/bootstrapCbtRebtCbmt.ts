import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { cbtRebtCbmt } from "../lib/cbt-rebt-cbmt-content";

// Standalone (non-January) "CBT, REBT & CBMT" certificate.
//
// Unlike the January 2027 cohort in `bootstrapJanuaryCohort.ts`, this creates a
// general, always-on certificate course with its own code, so it can be sold
// outside the January cohort without disturbing it.
//
// Run once against a deployment:
//   npx convex run bootstrapCbtRebtCbmt:createStandaloneCourse            # dev
//   npx convex run bootstrapCbtRebtCbmt:createStandaloneCourse --prod     # production
//
// Safe to re-run: the course is matched by code (then exact name) and patched,
// never duplicated.
//
// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM BEFORE RUNNING: PRICE and USES_BATCHES below are placeholders.
// Set PRICE to the real amount, and either leave USES_BATCHES false (the course
// is immediately purchasable, admin can attach batches later) or set it true
// and fill in STANDALONE_BATCH with real dates before running.
// ─────────────────────────────────────────────────────────────────────────────

const COURSE_CODE = "CCBT3";
const COURSE_NAME = "CBT, REBT & CBMT";
const COURSE_PRICE = 3499; // TODO confirm
const USES_BATCHES = false;

// Only used when USES_BATCHES is true.
const STANDALONE_BATCH = {
  label: "Next cohort",
  startDate: "2027-02-02", // TODO confirm
  endDate: "2027-03-30", // TODO confirm
  startTime: "19:30",
  endTime: "21:00",
  daysOfWeek: ["Tuesday", "Thursday"],
  capacity: 30,
};

const LEARNING_ICONS = ["brain", "refresh", "message-circle", "leaf", "shield"];

const SEARCH_TEXT =
  "CBT REBT CBMT cognitive behavioural therapy rational emotive behaviour therapy mindfulness certificate live cohort practice supervision";

const PREREQUISITES =
  "Open to psychology students, graduates and practising counsellors. No prior clinical practice required.";

export const createStandaloneCourse = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const actor = "bootstrap:cbt-rebt-cbmt";
    const courses = await ctx.db.query("courses").take(2000);

    const existing =
      courses.find((course) => course.code === COURSE_CODE) ??
      courses.find((course) => course.name === COURSE_NAME);

    const fields = {
      name: COURSE_NAME,
      code: COURSE_CODE,
      type: "certificate" as const,
      price: COURSE_PRICE,
      usesBatches: USES_BATCHES,
      lifecycleStatus: "published" as const,
      description: cbtRebtCbmt.description,
      content: SEARCH_TEXT,
      imageUrls: ["/coastal/shore.jpg"],
      learningOutcomes: cbtRebtCbmt.learningOutcomes.map((title, i) => ({
        icon: LEARNING_ICONS[i] ?? "brain",
        title,
      })),
      modules: cbtRebtCbmt.modules,
      outcomes: cbtRebtCbmt.outcomes,
      painPoints: cbtRebtCbmt.painPoints,
      whyDifferent: cbtRebtCbmt.whyDifferent,
      prerequisites: PREREQUISITES,
      updatedAt: now,
      updatedByAdminId: actor,
    };

    let courseId: Id<"courses">;
    let courseCreated = false;
    if (existing) {
      await ctx.db.patch(existing._id, fields);
      courseId = existing._id;
    } else {
      courseId = await ctx.db.insert("courses", {
        ...fields,
        enrolledUsers: [],
        reviews: [],
        publishedAt: now,
        createdByAdminId: actor,
      });
      courseCreated = true;
    }

    let batchId: Id<"courseBatches"> | null = null;
    if (USES_BATCHES) {
      const batches = await ctx.db
        .query("courseBatches")
        .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
        .collect();
      const existingBatch = batches.find(
        (batch) => batch.label === STANDALONE_BATCH.label,
      );
      const batchFields = {
        courseId,
        ...STANDALONE_BATCH,
        lifecycleStatus: "published" as const,
        updatedAt: now,
        updatedByAdminId: actor,
      };
      if (existingBatch) {
        await ctx.db.patch(existingBatch._id, batchFields);
        batchId = existingBatch._id;
      } else {
        batchId = await ctx.db.insert("courseBatches", {
          ...batchFields,
          enrolledUsers: [],
          sortOrder: batches.length,
          createdByAdminId: actor,
        });
      }
    }

    return { courseId, courseCreated, batchId };
  },
});
