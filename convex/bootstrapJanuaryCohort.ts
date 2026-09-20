import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Idempotent bootstrap for the January 2027 pilot cohort.
//
// Creates (or updates) the CCCFT certificate course and its published January
// 2027 batch, so the cohort goes on sale without the multi-step admin dance
// (draft course -> published batch -> publish), which cannot be done in one
// admin call.
//
// Run once against a deployment:
//   npx convex run bootstrapJanuaryCohort:createJanuaryCohort            # dev
//   npx convex run bootstrapJanuaryCohort:createJanuaryCohort --prod     # production
//
// Safe to re-run: the course is matched by name + type, the batch by course +
// label, and existing rows are patched rather than duplicated.

// Pricing and offer follow the locked January decision (#133): full price
// ₹2,999, early bird ₹1,999 until 15 December, no bundle. Schedule, capacity
// and timeline follow the registration plan (#134): 30 seats, starts mid
// January 2027.
//
// REVIEW BEFORE RUNNING: the descriptive copy below is founder-review copy.
// Confirm the name, code, description, modules, outcomes and image before you
// publish this to production.
const COURSE = {
  name: "Relationship Psychology: Marital & Family Therapy",
  code: "CCCFT",
  type: "certificate" as const,
  price: 2999,
  offer: {
    name: "Early bird",
    discountType: "fixedPrice" as const,
    discountValue: 1999,
    startDate: "2026-11-15",
    endDate: "2026-12-15",
  },
  duration: "8 weeks · live online · Tuesdays & Thursdays",
  prerequisites:
    "Open to psychology students, graduates and practising counsellors. No prior clinical practice required.",
  description:
    "An eight-week live certificate in relationship psychology, focused on marital and family therapy. Learn to assess, formulate and work with couples and families using established approaches, in a small supervised group — built for psychology students, graduates and counsellors in India.",
  content:
    "Marital and family therapy relationship psychology couple therapy certificate live cohort January 2027",
  learningOutcomes: [
    { icon: "users", title: "Assess couples and families as a system" },
    {
      icon: "clipboard",
      title: "Formulate relationship and family difficulties",
    },
    {
      icon: "message-circle",
      title: "Use core couple and family therapy skills",
    },
    { icon: "shield", title: "Work ethically within your scope of practice" },
    { icon: "file-check", title: "Plan and review a course of therapy" },
  ],
  modules: [
    {
      title: "Foundations of relationship psychology",
      description:
        "Attachment, systems thinking and how relationships shape us. What the evidence supports, and where it is still thin.",
    },
    {
      title: "Assessment and formulation",
      description:
        "Meeting a couple or family, mapping the system, and building a shared formulation.",
    },
    {
      title: "Core couple therapy skills",
      description:
        "Communication, conflict and repair. Active listening, reframing and structuring a session.",
    },
    {
      title: "Family therapy across the lifespan",
      description:
        "Parenting, transitions, loss and intergenerational patterns. Working with children in the system.",
    },
    {
      title: "Working with difference and context",
      description:
        "Culture, gender, class and family structure in the Indian context. Staying curious, not prescriptive.",
    },
    {
      title: "Ethics, scope and referrals",
      description:
        "Consent, confidentiality, couple-versus-individual work, and when to refer on.",
    },
    {
      title: "Supervised practice",
      description:
        "Simulated and role-played sessions with feedback, so you build confidence before real clients.",
    },
    {
      title: "Integration and next steps",
      description:
        "Pulling it together, a personal development plan, and the honest limits of the certificate.",
    },
  ],
  outcomes: [
    "You can meet a couple or family without freezing.",
    "You can hold a formulation and share it clearly.",
    "You know the core techniques and when to use them.",
    "You know your scope — and when to refer on.",
    "You have a plan for continued supervised practice.",
  ],
  painPoints: [
    "Most courses stop at theory and never put you in the room.",
    "Live practice is expensive and hard to find in India.",
    "You want skills you can actually use, not just notes.",
  ],
  whyDifferent: [
    "Live, small cohorts with real practice and feedback.",
    "Taught by practising clinicians, not marketers.",
    "A certificate that states completion honestly.",
    "Paced for real life, phone-first and affordable.",
  ],
  imageUrls: ["/coastal/shore.jpg", "/coastal/calm.jpg"],
};

const BATCH = {
  label: "January 2027 cohort",
  startDate: "2027-01-12",
  endDate: "2027-03-09",
  startTime: "19:30",
  endTime: "21:00",
  daysOfWeek: ["Tuesday", "Thursday"],
  capacity: 30,
};

export const createJanuaryCohort = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const existingCourse = await ctx.db
      .query("courses")
      .withIndex("by_name_and_type", (q) =>
        q.eq("name", COURSE.name).eq("type", COURSE.type),
      )
      .first();

    const courseFields = {
      name: COURSE.name,
      code: COURSE.code,
      type: COURSE.type,
      price: COURSE.price,
      offer: COURSE.offer,
      description: COURSE.description,
      content: COURSE.content,
      duration: COURSE.duration,
      prerequisites: COURSE.prerequisites,
      learningOutcomes: COURSE.learningOutcomes,
      modules: COURSE.modules,
      outcomes: COURSE.outcomes,
      painPoints: COURSE.painPoints,
      whyDifferent: COURSE.whyDifferent,
      imageUrls: COURSE.imageUrls,
      usesBatches: true,
      lifecycleStatus: "published" as const,
      updatedAt: now,
    };

    let courseId: Id<"courses">;
    let courseCreated = false;
    if (existingCourse) {
      await ctx.db.patch(existingCourse._id, courseFields);
      courseId = existingCourse._id;
    } else {
      courseId = await ctx.db.insert("courses", {
        ...courseFields,
        enrolledUsers: [],
        reviews: [],
        publishedAt: now,
        createdByAdminId: "bootstrap:january-2027",
        updatedByAdminId: "bootstrap:january-2027",
      });
      courseCreated = true;
    }

    const batches = await ctx.db
      .query("courseBatches")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    const existingBatch = batches.find((b) => b.label === BATCH.label);
    const batchFields = {
      courseId,
      label: BATCH.label,
      startDate: BATCH.startDate,
      endDate: BATCH.endDate,
      startTime: BATCH.startTime,
      endTime: BATCH.endTime,
      daysOfWeek: BATCH.daysOfWeek,
      capacity: BATCH.capacity,
      lifecycleStatus: "published" as const,
      updatedAt: now,
    };

    let batchId: Id<"courseBatches">;
    let batchCreated = false;
    if (existingBatch) {
      await ctx.db.patch(existingBatch._id, batchFields);
      batchId = existingBatch._id;
    } else {
      batchId = await ctx.db.insert("courseBatches", {
        ...batchFields,
        enrolledUsers: [],
        sortOrder: batches.length,
        createdByAdminId: "bootstrap:january-2027",
        updatedByAdminId: "bootstrap:january-2027",
      });
      batchCreated = true;
    }

    return { courseId, batchId, courseCreated, batchCreated };
  },
});
