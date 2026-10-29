import { internalMutation } from "./_generated/server";

// PTSD certificate course, created as an unpublished draft.
//
// The start date and time are supplied by the owner (2 February 2027,
// 5:30–6:30 pm IST). Session days/frequency and faculty are NOT supplied, so no
// cohort is created here: a batch needs a weekly pattern we do not have, and
// inventing one would put wrong dates in front of students.
//
//   npx convex run bootstrapPtsdDraft:createPtsdDraft --prod

const ACTOR = "bootstrap:ptsd-draft";
const CODE = "CCPTSD";

const MODULES = [
  ["Foundations of Psychological Trauma", "What trauma is, how it differs from stress, and the vocabulary used in trauma-informed practice."],
  ["PTSD: Symptoms, Diagnostic Frameworks and Clinical Presentation", "The diagnostic criteria, how presentation varies, and what the frameworks can and cannot tell you."],
  ["Complex PTSD and Developmental Trauma", "How prolonged or early relational trauma differs from single-incident trauma, and why the distinction changes the work."],
  ["Trauma, the Nervous System and Somatic Manifestations", "How threat responses show up in the body, and what that means for pacing and safety."],
  ["Trauma-Informed Assessment and Case Formulation", "Taking a history carefully, recognising risk, and building a formulation rather than a label."],
  ["Evidence-Based Therapeutic Approaches", "The main therapeutic approaches, what the evidence supports, and where scope ends."],
  ["Practical Training: Case Analysis and Formulation", "Faculty-curated work on fictional cases, with feedback on your reasoning."],
  ["Practical Training: Simulations, Ethics and Integration", "Simulated practice, ethical decision-making and pulling the eight weeks together."],
] as const;

export const createPtsdDraft = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const existing = courses.find((course) => course.code === CODE);

    const fields = {
      name: "Certificate Course in Post-Traumatic Stress Disorder (PTSD) & Complex Trauma",
      code: CODE,
      type: "certificate" as const,
      price: 4500,
      lifecycleStatus: "draft" as const,
      salesEnabled: false,
      usesBatches: true,
      description:
        "An eight-week certificate course in trauma: how PTSD and complex trauma are understood, assessed and formulated, with two weeks of faculty-curated practical application.",
      content:
        "PTSD complex trauma certificate course six weeks learning two weeks practical trauma-informed assessment formulation evidence-based approaches",
      modules: MODULES.map(([title, description]) => ({ title, description })),
      learningOutcomes: [
        { icon: "book-open", title: "Describe trauma and its psychological effects" },
        { icon: "clipboard", title: "Use the diagnostic frameworks carefully" },
        { icon: "layers", title: "Distinguish PTSD from complex trauma" },
        { icon: "activity", title: "Recognise somatic and nervous-system responses" },
        { icon: "search", title: "Build a trauma-informed formulation" },
        { icon: "shield", title: "Work within scope and refer appropriately" },
      ],
      prerequisites: "None. No prior clinical training is required.",
      enrolledUsers: [], reviews: [],
      updatedAt: now,
      updatedByAdminId: ACTOR,
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return { action: "updated", courseId: String(existing._id), code: CODE };
    }

    const courseId = await ctx.db.insert("courses", {
      ...fields,
      createdAtAdminId: undefined,
      createdByAdminId: ACTOR,
    } as never);
    await ctx.db.patch(courseId, { createdByAdminId: ACTOR });
    return { action: "created", courseId: String(courseId), code: CODE };
  },
});
