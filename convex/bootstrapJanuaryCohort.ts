import { internalMutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// January 2027 cohorts for Inner Child Healing & Therapy, Personality
// Disorders, and the Counselling Psychology internship.
//
// CBT, REBT and CBMT (and its self-paced introduction) are seeded separately by
// `bootstrapCbtProgramme`. This file deliberately does NOT touch CBT.
//
// Owner-supplied dates and fees (all times IST):
//   Inner Child Healing & Therapy  28 Jan – 23 Mar 2027, Tue & Thu, 18:30–19:30
//   Personality Disorders          21 Jan – 16 Mar 2027, Tue & Thu, 20:30–21:30
//   Counselling Psychology         18 Jan – 17 Feb 2027, Mon/Wed/Fri, 19:30–20:30
//
// Certificate fee: ₹2,499 for the live 8 weeks (no early bird).
// The internship fee is not yet confirmed, so it is created as a DRAFT.
//
// Run once against a deployment:
//   npx convex run bootstrapJanuaryCohort:createJanuaryCohort --prod
//
// Idempotent: courses are matched by code (then name), batches by course +
// label, and existing rows are patched, not duplicated.

const CERT_PRICE = 2499;
const COHORT_CAPACITY = 30;

type CourseSeed = {
  match: string;
  code: string;
  name: string;
  type: "certificate" | "internship";
  price: number;
  lifecycleStatus: "published" | "draft";
  description: string;
  searchText: string;
  imageUrls: string[];
  learningOutcomes: { icon: string; title: string }[];
  modules: { title: string; description: string }[];
  outcomes: string[];
  painPoints: string[];
  whyDifferent: string[];
  prerequisites: string;
  batch: {
    label: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    capacity: number;
  };
};

const COURSES: CourseSeed[] = [
  {
    match: "Inner Child Healing",
    code: "CCICH",
    name: "Inner Child Healing & Therapy",
    type: "certificate",
    price: CERT_PRICE,
    lifecycleStatus: "published",
    description:
      "An eight-week live certificate guiding you through inner child healing: how childhood experiences shape adult beliefs and relationships, and practical, trauma-informed ways to nurture, validate and reconnect with the inner child.",
    searchText:
      "inner child healing therapy trauma informed self compassion certificate live cohort January 2027",
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
    prerequisites:
      "Open to psychology students, graduates and practising counsellors. No prior clinical practice required.",
    batch: {
      label: "January 2027 cohort",
      startDate: "2027-01-28",
      endDate: "2027-03-23",
      startTime: "18:30",
      endTime: "19:30",
      daysOfWeek: ["Tuesday", "Thursday"],
      capacity: COHORT_CAPACITY,
    },
  },
  {
    match: "Personality Disorders",
    code: "CCPD",
    name: "Personality Disorders",
    type: "certificate",
    price: CERT_PRICE,
    lifecycleStatus: "published",
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
    prerequisites:
      "Open to psychology students, graduates and practising counsellors. No prior clinical practice required.",
    batch: {
      label: "January 2027 cohort",
      startDate: "2027-01-21",
      endDate: "2027-03-16",
      startTime: "20:30",
      endTime: "21:30",
      daysOfWeek: ["Tuesday", "Thursday"],
      capacity: COHORT_CAPACITY,
    },
  },
  {
    match: "Counselling Psychology",
    code: "INCPSY",
    name: "Counselling Psychology",
    type: "internship",
    // Fee not confirmed — created as a draft so it is not sold at a guess.
    price: 0,
    lifecycleStatus: "draft",
    description:
      "A fourteen-class supervised counselling internship, offered by application. Move from learning counselling to practising counselling skills with structured supervision and feedback.",
    searchText:
      "counselling psychology internship supervised practice application cohort January 2027",
    imageUrls: ["/coastal/shore.jpg"],
    learningOutcomes: [
      { icon: "heart-handshake", title: "Practise core counselling skills" },
      { icon: "clipboard", title: "Structure and review a counselling session" },
      { icon: "users", title: "Use supervision and peer feedback well" },
      { icon: "shield", title: "Work ethically and within your scope" },
    ],
    modules: [
      {
        title: "Foundations of counselling practice",
        description:
          "Core skills, the therapeutic relationship, and working within your scope.",
      },
      {
        title: "Structured sessions",
        description:
          "Opening, focusing, deepening and closing a session, with feedback.",
      },
      {
        title: "Supervised practice",
        description:
          "Supervised and peer practice with structured feedback and review.",
      },
      {
        title: "Ethics and referral",
        description:
          "Boundaries, consent, risk, supervision and when to refer on.",
      },
    ],
    outcomes: [
      "You can run a structured counselling session.",
      "You can use supervision and feedback well.",
      "You can reflect on your own practice.",
      "You know your scope — and when to refer on.",
    ],
    painPoints: [
      "It is hard to move from theory to actually practising counselling.",
      "Supervised practice is scarce and unstructured.",
      "You want honest feedback, not just attendance.",
    ],
    whyDifferent: [
      "Supervised, cohort-based practice, not self-paced video.",
      "Small groups with structured feedback.",
      "Offered by application so supervision stays workable.",
      "A certificate that states completion honestly.",
    ],
    prerequisites:
      "Offered by application. Prior counselling or psychology study recommended, not required.",
    batch: {
      label: "January 2027 cohort",
      startDate: "2027-01-18",
      endDate: "2027-02-17",
      startTime: "19:30",
      endTime: "20:30",
      daysOfWeek: ["Monday", "Wednesday", "Friday"],
      capacity: COHORT_CAPACITY,
    },
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
      lifecycleStatus: string;
    }[] = [];

    for (const seed of COURSES) {
      const existing = findCourse(courses, seed);
      const pricing = {
        price: seed.price,
        usesBatches: true,
        lifecycleStatus: seed.lifecycleStatus,
        updatedAt: now,
        updatedByAdminId: actor,
      };

      let courseId: Id<"courses">;
      let courseCreated = false;
      if (existing) {
        await ctx.db.patch(existing._id, {
          name: seed.name,
          ...pricing,
          publishedAt:
            seed.lifecycleStatus === "published"
              ? (existing.publishedAt ?? now)
              : existing.publishedAt,
        });
        courseId = existing._id;
      } else {
        courseId = await ctx.db.insert("courses", {
          name: seed.name,
          code: seed.code,
          type: seed.type,
          ...pricing,
          description: seed.description,
          content: seed.searchText,
          imageUrls: seed.imageUrls,
          learningOutcomes: seed.learningOutcomes,
          modules: seed.modules,
          outcomes: seed.outcomes,
          painPoints: seed.painPoints,
          whyDifferent: seed.whyDifferent,
          prerequisites: seed.prerequisites,
          enrolledUsers: [],
          reviews: [],
          ...(seed.lifecycleStatus === "published"
            ? { publishedAt: now }
            : {}),
          createdByAdminId: actor,
        });
        courseCreated = true;
      }

      const batches = await ctx.db
        .query("courseBatches")
        .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
        .collect();
      const existingBatch = batches.find(
        (batch) => batch.label === seed.batch.label,
      );
      const batchFields = {
        courseId,
        label: seed.batch.label,
        startDate: seed.batch.startDate,
        endDate: seed.batch.endDate,
        startTime: seed.batch.startTime,
        endTime: seed.batch.endTime,
        daysOfWeek: seed.batch.daysOfWeek,
        capacity: seed.batch.capacity,
        lifecycleStatus: seed.lifecycleStatus,
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

      results.push({
        name: seed.name,
        code: seed.code,
        courseId,
        batchId,
        courseCreated,
        batchCreated,
        lifecycleStatus: seed.lifecycleStatus,
      });
    }

    return { courses: results };
  },
});
