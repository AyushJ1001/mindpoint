import { internalMutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Idempotent bootstrap for the January 2027 certificate cohorts.
//
// Opens December registrations for the three January certificate courses by
// ensuring each course exists, carries the January pricing and offer, and has
// one published January 2027 batch. Existing courses keep their authored
// content — only the January pricing, offer and batch are written.
//
// Run once against a deployment:
//   npx convex run bootstrapJanuaryCohort:createJanuaryCohort            # dev
//   npx convex run bootstrapJanuaryCohort:createJanuaryCohort --prod     # production
//
// Safe to re-run: a course is matched by name (then code), a batch by course +
// label, and existing rows are patched rather than duplicated.

// Pricing follows the locked January decision (#133): ₹2,999 with an early
// bird of ₹1,999 until 15 December, full payment only. Schedule and capacity
// follow the registration plan (#134): 30 seats, shared Tue/Thu evening slot
// from mid January 2027.
//
// REVIEW BEFORE RUNNING: the Personality Disorders copy is founder-review
// copy. Confirm it before publishing to production. It is the only course
// created from scratch; the other two already exist.
const JANUARY_PRICE = 2999;

const JANUARY_OFFER = {
  name: "Early bird",
  discountType: "fixedPrice" as const,
  discountValue: 1999,
  startDate: "2026-11-15",
  endDate: "2026-12-15",
};

const JANUARY_BATCH = {
  label: "January 2027 cohort",
  startDate: "2027-01-12",
  endDate: "2027-03-09",
  startTime: "19:30",
  endTime: "21:00",
  daysOfWeek: ["Tuesday", "Thursday"],
  capacity: 30,
};

type CourseSeed = {
  // Distinctive name fragment used to find an existing course before the code.
  match: string;
  code: string;
  name: string;
  type: "certificate";
  description: string;
  searchText: string;
  imageUrls: string[];
  learningOutcomes: { icon: string; title: string }[];
  modules: { title: string; description: string }[];
  outcomes: string[];
  painPoints: string[];
  whyDifferent: string[];
};

const COURSES: CourseSeed[] = [
  {
    // Matched by the comma form so the standalone "CBT, REBT & CBMT"
    // (bootstrapCbtRebtCbmt.ts, code CCBT3) is never picked up by accident.
    match: "CBT, REBT, CBMT",
    code: "CCCBT",
    name: "CBT, REBT, CBMT",
    type: "certificate",
    description:
      "An eight-week live certificate covering the three core cognitive and behavioural approaches — CBT, REBT and CBMT — and how to use them with real clients, in a small supervised group.",
    searchText:
      "CBT REBT CBMT cognitive behavioural therapy rational emotive behaviour therapy mindfulness certificate live cohort January 2027",
    imageUrls: ["/coastal/shore.jpg"],
    learningOutcomes: [
      { icon: "brain", title: "Explain the cognitive model and where it fits" },
      {
        icon: "refresh",
        title: "Challenge and restructure unhelpful thinking",
      },
      {
        icon: "message-circle",
        title: "Use REBT's disputation with real clients",
      },
      { icon: "leaf", title: "Weave mindfulness into behavioural work" },
      { icon: "shield", title: "Work safely within your scope of practice" },
    ],
    modules: [
      {
        title: "Foundations of CBT",
        description:
          "The cognitive model — thoughts, emotions and behaviour. Where CBT came from, what the evidence supports, and where it is thin.",
      },
      {
        title: "Cognitive restructuring",
        description:
          "Identifying and challenging cognitive distortions, and building a shared formulation with a client.",
      },
      {
        title: "Behavioural work",
        description:
          "Behavioural activation, exposure and graded tasks, applied carefully and with consent.",
      },
      {
        title: "REBT: rational emotive behaviour therapy",
        description:
          "The ABC model, irrational beliefs and disputation. How REBT differs from and complements CBT.",
      },
      {
        title: "CBMT: mindfulness in practice",
        description:
          "Bringing mindfulness into cognitive and behavioural work — attention, acceptance and present-moment practice.",
      },
      {
        title: "Working across the three",
        description:
          "Choosing an approach for the person in front of you, and combining them without muddle.",
      },
      {
        title: "Supervised practice",
        description:
          "Role-played and simulated sessions with feedback, so you build confidence before real clients.",
      },
      {
        title: "Integration and next steps",
        description:
          "Pulling it together, a development plan, and the honest limits of the certificate.",
      },
    ],
    outcomes: [
      "You can explain the cognitive model plainly.",
      "You can challenge a thought without arguing with the person.",
      "You can use REBT's disputation and CBMT's mindfulness.",
      "You can choose an approach for the person in front of you.",
      "You know your scope — and when to refer on.",
    ],
    painPoints: [
      "CBT, REBT and CBMT are usually taught separately and never joined up.",
      "Most courses stop at theory and never put you in the room.",
      "You want skills you can actually use with a client, not just notes.",
      "You're not sure which approach to reach for — or how to combine them safely.",
    ],
    whyDifferent: [
      "All three approaches in one coherent certificate.",
      "Live, small cohorts with real practice and feedback.",
      "Taught by practising clinicians, not marketers.",
      "A certificate that states completion honestly.",
    ],
  },
  {
    match: "Inner Child Healing",
    code: "CCICH",
    name: "Inner Child Healing",
    type: "certificate",
    description:
      "A six-week live certificate guiding you through inner child healing: how childhood experiences shape adult beliefs and relationships, and practical, trauma-informed ways to nurture, validate and reconnect with the inner child.",
    searchText:
      "inner child healing trauma informed self compassion certificate live cohort January 2027",
    imageUrls: ["/coastal/calm.jpg"],
    learningOutcomes: [
      {
        icon: "heart",
        title: "Understand the inner child and its role in wellbeing",
      },
      {
        icon: "history",
        title: "Recognise childhood wounds in adult patterns",
      },
      { icon: "hands", title: "Nurture, validate and comfort the inner child" },
      {
        icon: "sparkles",
        title: "Use visualisation, expressive arts and relationship work",
      },
      { icon: "shield", title: "Stay trauma-informed and within your scope" },
    ],
    modules: [
      {
        title: "Understanding the inner child",
        description:
          "What the inner child means, and the impact of childhood experience on adult life.",
      },
      {
        title: "Healing through self-compassion",
        description:
          "Cultivating self-compassion and practices for nurturing and comforting the inner child.",
      },
      {
        title: "Childhood wounds and adult patterns",
        description:
          "Recognising attachment and relational patterns, and how they show up with clients.",
      },
      {
        title: "Expressive and creative approaches",
        description:
          "Guided visualisation, expressive arts and relationship-focused healing approaches.",
      },
      {
        title: "Integration and forgiveness",
        description:
          "Working with grief, anger and forgiveness at a pace the person can carry.",
      },
      {
        title: "Supervised practice",
        description:
          "Role-played practice with feedback, and the honest limits of the certificate.",
      },
    ],
    outcomes: [
      "You can explain inner child work without jargon.",
      "You can recognise childhood wounds in adult patterns.",
      "You can guide simple, safe healing practices.",
      "You work in a trauma-informed way.",
      "You know your scope — and when to refer on.",
    ],
    painPoints: [
      "Inner child work is often taught as vague, feel-good content.",
      "Clients arrive with old wounds and most courses never show you how to hold them.",
      "You want a trauma-informed foundation, not just exercises.",
    ],
    whyDifferent: [
      "Trauma-informed and grounded, not vague.",
      "Live, small cohorts with real practice and feedback.",
      "Taught by practising clinicians, not marketers.",
      "A certificate that states completion honestly.",
    ],
  },
  {
    match: "Personality Disorders",
    code: "CCPD",
    name: "Personality Disorders",
    type: "certificate",
    description:
      "An eight-week live certificate introducing personality disorders — how they are classified, assessed and understood, and how to work with them ethically and effectively. Covers the clusters, formulation, risk, and CBT, DBT and schema-informed approaches, with a trauma-informed, non-stigmatising stance throughout.",
    searchText:
      "personality disorders cluster A B C borderline narcissistic avoidant assessment formulation risk CBT DBT schema certificate live cohort January 2027",
    imageUrls: ["/coastal/hero.jpg"],
    learningOutcomes: [
      {
        icon: "book-open",
        title: "Describe the recognised personality disorder categories",
      },
      {
        icon: "clipboard",
        title: "Assess and formulate without reducing a person to a label",
      },
      {
        icon: "heart-handshake",
        title: "Hold a trauma-informed, non-stigmatising stance",
      },
      {
        icon: "brain",
        title: "Use core CBT, DBT and schema-informed strategies",
      },
      { icon: "shield", title: "Recognise risk, set boundaries and refer on" },
    ],
    modules: [
      {
        title: "What personality disorders are — and are not",
        description:
          "Classification, the DSM-5 and ICD clusters, the debate around labels, and the stigma that surrounds them.",
      },
      {
        title: "Cluster A: odd and eccentric",
        description:
          "Paranoid, schizoid and schizotypal presentations, and the therapeutic stance that helps.",
      },
      {
        title: "Cluster B: dramatic and emotional, part one",
        description:
          "Borderline personality disorder — emotional dysregulation, self-harm, and the therapeutic relationship.",
      },
      {
        title: "Cluster B: dramatic and emotional, part two",
        description:
          "Narcissistic, histrionic and antisocial presentations, and working without judgement.",
      },
      {
        title: "Cluster C: anxious and fearful",
        description:
          "Avoidant, dependent and obsessive-compulsive presentations in practice.",
      },
      {
        title: "Assessment, formulation and risk",
        description:
          "Gathering history, building a shared formulation, and assessing risk carefully.",
      },
      {
        title: "Evidence-based approaches",
        description:
          "CBT, DBT-informed and schema-informed work, compassion-focused practice, and their limits.",
      },
      {
        title: "Ethics, boundaries and supervision",
        description:
          "Boundaries, supervision, referral, and the honest limits of the certificate.",
      },
    ],
    outcomes: [
      "You can discuss personality disorders accurately and without stigma.",
      "You recognise the clusters and their common presentations.",
      "You can formulate difficulties and plan a course of support.",
      "You know evidence-based approaches and their limits.",
      "You know your scope — and when to refer on.",
    ],
    painPoints: [
      "Personality disorders are widely misunderstood and stigmatised.",
      "Most training stops at labels and never covers how to work with the person.",
      "You want an ethical, evidence-informed foundation before you practise.",
    ],
    whyDifferent: [
      "A trauma-informed, non-stigmatising stance throughout.",
      "Live, small cohorts with case discussion.",
      "Taught by practising clinicians, not marketers.",
      "A certificate that states completion honestly.",
    ],
  },
];

function findCourse(
  courses: Doc<"courses">[],
  seed: CourseSeed,
): Doc<"courses"> | undefined {
  const byName = courses.find((course) =>
    course.name.toLowerCase().includes(seed.match.toLowerCase()),
  );
  if (byName) {
    return byName;
  }
  return courses.find((course) => course.code === seed.code);
}

export const createJanuaryCohort = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const actor = "bootstrap:january-2027";
    const courses = await ctx.db.query("courses").take(2000);

    const results: {
      name: string;
      code: string;
      courseId: Id<"courses">;
      batchId: Id<"courseBatches">;
      courseCreated: boolean;
      batchCreated: boolean;
      lessonsCreated: number;
    }[] = [];

    for (const seed of COURSES) {
      const existing = findCourse(courses, seed);
      const januaryCourseFields = {
        price: JANUARY_PRICE,
        offer: JANUARY_OFFER,
        usesBatches: true,
        lifecycleStatus: "published" as const,
        updatedAt: now,
        updatedByAdminId: actor,
      };

      let courseId: Id<"courses">;
      let courseCreated = false;
      if (existing) {
        // Preserve the authored content; only the January pricing and
        // offer are written.
        await ctx.db.patch(existing._id, {
          ...januaryCourseFields,
          publishedAt: existing.publishedAt ?? now,
        });
        courseId = existing._id;
      } else {
        courseId = await ctx.db.insert("courses", {
          name: seed.name,
          code: seed.code,
          type: seed.type,
          ...januaryCourseFields,
          description: seed.description,
          content: seed.searchText,
          imageUrls: seed.imageUrls,
          learningOutcomes: seed.learningOutcomes,
          modules: seed.modules,
          outcomes: seed.outcomes,
          painPoints: seed.painPoints,
          whyDifferent: seed.whyDifferent,
          prerequisites:
            "Open to psychology students, graduates and practising counsellors. No prior clinical practice required.",
          enrolledUsers: [],
          reviews: [],
          publishedAt: now,
          createdByAdminId: actor,
        });
        courseCreated = true;
      }

      const batches = await ctx.db
        .query("courseBatches")
        .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
        .collect();
      const existingBatch = batches.find(
        (batch) => batch.label === JANUARY_BATCH.label,
      );
      const batchFields = {
        courseId,
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

      // Seed LMS lessons from the module outline (one lesson per module) so the
      // course is usable in the learner dashboard straight away. Skipped if the
      // course already has lessons, so admins can safely enrich/replace them.
      const existingLessons = await ctx.db
        .query("lessons")
        .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
        .collect();
      let lessonsCreated = 0;
      if (existingLessons.length === 0) {
        for (let index = 0; index < seed.modules.length; index++) {
          const module = seed.modules[index];
          await ctx.db.insert("lessons", {
            courseId,
            moduleTitle: module.title,
            title: module.title,
            description: module.description,
            kind: "text" as const,
            textContent: module.description,
            sortOrder: index,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
            createdByAdminId: actor,
          });
          lessonsCreated += 1;
        }
      }

      results.push({
        name: seed.name,
        code: seed.code,
        courseId,
        batchId,
        courseCreated,
        batchCreated,
        lessonsCreated,
      });
    }

    return { courses: results };
  },
});
