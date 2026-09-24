import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// CBT-only bootstrap: opens registrations for the CBT, REBT and CBMT
// programme without touching the other January courses.
//
// Creates / updates:
//   1. the live applied certificate "CBT, REBT and CBMT" (code CCCBT) with the
//      locked January pricing, early-bird offer and one published January 2027
//      cohort;
//   2. a DRAFT self-paced introduction "Introduction to CBT, REBT and CBMT",
//      kept unpublished so the storefront shows it as "Not currently
//      available" until a price is configured (never guess a price).
//
// Pricing and schedule follow the locked January decisions (#133/#134).
//
// Run once against a deployment:
//   npx convex run bootstrapCbtProgramme:createCbtProgramme --prod
//
// Idempotent: the live course is matched by code, the batch by course + label,
// the introduction by name, and existing rows are patched, not duplicated.

// Owner-supplied January 2027 CBT figures. Times are IST.
const LIVE_PRICE = 2499;
const INTRO_PRICE = 1299;

const JANUARY_BATCH = {
  label: "January 2027 cohort",
  startDate: "2027-01-19",
  endDate: "2027-03-11",
  startTime: "19:30",
  endTime: "20:30",
  daysOfWeek: ["Tuesday", "Thursday"],
  capacity: 30,
};

const LIVE_CODE = "CCCBT";
const LIVE_NAME = "CBT, REBT and CBMT";
const INTRO_CODE = "PRCBTI";
const INTRO_NAME = "Introduction to CBT, REBT and CBMT";

const LIVE_CONTENT = {
  description:
    "A two-stage certificate: eight recorded introductory lessons to build the foundations, then eight live applied sessions working through fictional cases in a small group.",
  searchText:
    "CBT REBT CBMT cognitive behaviour modification therapy rational emotive behaviour therapy applied live cohort certificate January 2027",
  imageUrls: ["/coastal/wave.jpg"],
  learningOutcomes: [
    { icon: "brain", title: "Describe the cognitive behavioural cycle and where each approach fits" },
    { icon: "search", title: "Distinguish an automatic thought, a rule and a possible core belief" },
    { icon: "refresh", title: "Use the REBT ABCDE map without denying a real loss" },
    { icon: "activity", title: "Choose between inquiry, experiments, activation, exposure and skills practice" },
    { icon: "clipboard", title: "Build and revise a provisional case formulation" },
    { icon: "shield", title: "Work within scope, with consent and appropriate boundaries" },
  ],
  modules: [
    {
      title: "Assessment, consent and a workable goal",
      description:
        "What to ask before choosing a method: the person's goal, a recent example, urgent concerns, strengths, preferences and whether an exercise is welcome.",
    },
    {
      title: "Building and revising a CBT formulation",
      description:
        "A collaborative explanation of a specific episode and the loop that may maintain it, revised when a new fact changes the story.",
    },
    {
      title: "Cognitive inquiry and behavioural experiments",
      description:
        "Questions that genuinely seek evidence, and modest, testable predictions with an agreed observation.",
    },
    {
      title: "Behavioural activation, exposure and skills practice",
      description:
        "Three methods that serve different purposes, and why a real barrier or unsafe setting changes the plan.",
    },
    {
      title: "REBT disputation and emotional change",
      description:
        "Logical, evidence-based and practical questions about rigid demands, protecting the person's values and context.",
    },
    {
      title: "CBMT self-instruction and stress inoculation training",
      description:
        "Self-observation, a short task-linked instruction, rehearsal and feedback; the broad phases of stress inoculation.",
    },
    {
      title: "Session structure, adaptation and professional boundaries",
      description:
        "Running a structured but responsive session, and adapting to language, privacy, access, time and power differences.",
    },
    {
      title: "Integration, outcome review and setback planning",
      description:
        "Bringing the approaches together, reviewing what changed and what did not, and writing a realistic plan for a difficult moment.",
    },
  ],
  outcomes: [
    "You can explain the three models and where each fits.",
    "You can separate what is known from what is inferred.",
    "You can build and revise a formulation.",
    "You can choose a method for a reason, not a label.",
    "You know your scope — and when to refer on.",
  ],
  painPoints: [
    "CBT, REBT and CBMT are usually taught separately and never joined up.",
    "Most courses stop at theory and never put you in the room.",
    "You want reasoning you can use, not a list of acronyms.",
  ],
  whyDifferent: [
    "All three approaches in one coherent route.",
    "Live, small cohorts with fictional case practice and feedback.",
    "A separate student manual for each stage.",
    "A certificate that states completion honestly.",
  ],
  prerequisites:
    "Prior familiarity with automatic thoughts, behavioural cycles, the REBT ABCDE map and self-instruction is recommended, not required. Complete the introduction or come with equivalent background.",
};

const INTRO_CONTENT = {
  description:
    "Eight recorded lessons that make the vocabulary, history and central ideas of CBT, REBT and CBMT understandable even if psychology is new to you, with substantial reading notes and reflection questions.",
  searchText:
    "Introduction to CBT REBT CBMT self-paced recorded lessons foundations cognitive behaviour modification therapy",
  imageUrls: ["/coastal/calm.jpg"],
  learningOutcomes: [
    { icon: "message-circle", title: "A shared language for studying psychology" },
    { icon: "history", title: "Where CBT, REBT and CBMT came from" },
    { icon: "refresh", title: "Understanding the cognitive behavioural cycle" },
    { icon: "search", title: "Automatic thoughts and deeper beliefs" },
    { icon: "activity", title: "Emotion, behaviour and learning" },
    { icon: "clipboard", title: "REBT beliefs and the ABCDE map" },
    { icon: "brain", title: "Cognitive behaviour modification and coping dialogue" },
    { icon: "layers", title: "Bringing the foundations together" },
  ],
  modules: [
    {
      title: "A shared language for studying psychology",
      description:
        "Separate what happened from what someone predicted, felt and did, and learn to distinguish observation, report and hypothesis.",
    },
    {
      title: "Where CBT, REBT and CBMT came from",
      description:
        "The questions that shaped behavioural learning, Beck's cognitive model, Ellis's REBT and Meichenbaum's cognitive behaviour modification work.",
    },
    {
      title: "Understanding the cognitive behavioural cycle",
      description:
        "Map a situation, meaning, emotion, body response, action and consequence, and see how an avoidance cycle may form.",
    },
    {
      title: "Automatic thoughts and deeper beliefs",
      description:
        "Recognise fast thoughts or images, conditional assumptions and broader belief themes, and treat pattern labels as prompts for inquiry.",
    },
    {
      title: "Emotion, behaviour and learning",
      description:
        "Why feelings deserve attention, and how negative reinforcement, behavioural activation, exposure and skills learning differ.",
    },
    {
      title: "REBT beliefs and the ABCDE map",
      description:
        "Work from an activating event through belief and consequence to disputation and a more flexible effective perspective.",
    },
    {
      title: "Cognitive behaviour modification and coping dialogue",
      description:
        "Self-observation, a brief task-specific self-instruction, rehearsal and feedback, and the broad phases of stress inoculation training.",
    },
    {
      title: "Bringing the foundations together",
      description:
        "Apply the three lenses to one fictional workplace situation and separate what is known from what is inferred.",
    },
  ],
  outcomes: [
    "You can describe the three approaches in plain language.",
    "You can separate observation from inference.",
    "You can map a behavioural cycle.",
    "You can use the REBT ABCDE map.",
    "You are ready for the applied live stage.",
  ],
  painPoints: [
    "Psychology feels closed to people without a degree.",
    "Textbooks explain terms but not what they mean in a real situation.",
    "You want a careful foundation before committing to live classes.",
  ],
  whyDifferent: [
    "Written for beginners, useful as a refresher for practitioners.",
    "Substantial student reading notes, not a slide deck.",
    "Fictional examples and reflection questions throughout.",
    "A clear route into the applied live course.",
  ],
};

export const createCbtProgramme = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const actor = "bootstrap:cbt-programme";
    const allCourses = await ctx.db.query("courses").take(2000);

    // ── 1. Live applied certificate ──────────────────────────────────
    const existingLive = allCourses.find(
      (course) =>
        course.code === LIVE_CODE ||
        course.name.toLowerCase().includes("cbmt"),
    );

    let liveCourseId: Id<"courses">;
    let liveCourseCreated = false;
    const livePricing = {
      price: LIVE_PRICE,
      usesBatches: true,
      lifecycleStatus: "published" as const,
      updatedAt: now,
      updatedByAdminId: actor,
    };

    if (existingLive) {
      // Preserve authored content; write the catalogue name, pricing and state.
      await ctx.db.patch(existingLive._id, {
        name: LIVE_NAME,
        ...livePricing,
        publishedAt: existingLive.publishedAt ?? now,
      });
      liveCourseId = existingLive._id;
    } else {
      liveCourseId = await ctx.db.insert("courses", {
        name: LIVE_NAME,
        code: LIVE_CODE,
        type: "certificate",
        ...livePricing,
        description: LIVE_CONTENT.description,
        content: LIVE_CONTENT.searchText,
        imageUrls: LIVE_CONTENT.imageUrls,
        learningOutcomes: LIVE_CONTENT.learningOutcomes,
        modules: LIVE_CONTENT.modules,
        outcomes: LIVE_CONTENT.outcomes,
        painPoints: LIVE_CONTENT.painPoints,
        whyDifferent: LIVE_CONTENT.whyDifferent,
        prerequisites: LIVE_CONTENT.prerequisites,
        enrolledUsers: [],
        reviews: [],
        publishedAt: now,
        createdByAdminId: actor,
      });
      liveCourseCreated = true;
    }

    const batches = await ctx.db
      .query("courseBatches")
      .withIndex("by_courseId", (q) => q.eq("courseId", liveCourseId))
      .collect();
    const existingBatch = batches.find(
      (batch) => batch.label === JANUARY_BATCH.label,
    );
    const batchFields = {
      courseId: liveCourseId,
      label: JANUARY_BATCH.label,
      startDate: JANUARY_BATCH.startDate,
      endDate: JANUARY_BATCH.endDate,
      startTime: JANUARY_BATCH.startTime,
      endTime: JANUARY_BATCH.endTime,
      daysOfWeek: JANUARY_BATCH.daysOfWeek,
      capacity: JANUARY_BATCH.capacity,
      lifecycleStatus: "published" as const,
      updatedAt: now,
      updatedByAdminId: actor,
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
        createdByAdminId: actor,
      });
      batchCreated = true;
    }

    // ── 2. Self-paced introduction (draft, not yet on sale) ──────────
    const existingIntro = allCourses.find(
      (course) =>
        course.code === INTRO_CODE ||
        course.name.toLowerCase() === INTRO_NAME.toLowerCase(),
    );

    let introCourseId: Id<"courses">;
    let introCourseCreated = false;
    if (existingIntro) {
      await ctx.db.patch(existingIntro._id, {
        price: INTRO_PRICE,
        lifecycleStatus: "published",
        publishedAt: existingIntro.publishedAt ?? now,
        updatedAt: now,
        updatedByAdminId: actor,
      });
      introCourseId = existingIntro._id;
    } else {
      introCourseId = await ctx.db.insert("courses", {
        name: INTRO_NAME,
        code: INTRO_CODE,
        type: "pre-recorded",
        price: INTRO_PRICE,
        lifecycleStatus: "published",
        usesBatches: false,
        description: INTRO_CONTENT.description,
        content: INTRO_CONTENT.searchText,
        imageUrls: INTRO_CONTENT.imageUrls,
        learningOutcomes: INTRO_CONTENT.learningOutcomes,
        modules: INTRO_CONTENT.modules,
        outcomes: INTRO_CONTENT.outcomes,
        painPoints: INTRO_CONTENT.painPoints,
        whyDifferent: INTRO_CONTENT.whyDifferent,
        prerequisites: "None. No prior psychology study is required.",
        enrolledUsers: [],
        reviews: [],
        updatedAt: now,
        createdByAdminId: actor,
      });
      introCourseCreated = true;
    }

    return {
      live: {
        courseId: liveCourseId,
        name: LIVE_NAME,
        code: LIVE_CODE,
        courseCreated: liveCourseCreated,
        batchId,
        batchCreated,
      },
      intro: {
        courseId: introCourseId,
        name: INTRO_NAME,
        code: INTRO_CODE,
        courseCreated: introCourseCreated,
        published: true,
      },
    };
  },
});
