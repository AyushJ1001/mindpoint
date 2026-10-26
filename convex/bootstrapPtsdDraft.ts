import { internalMutation } from "./_generated/server";

// Creates the PTSD & Complex Trauma certificate as an unpublished draft.
// Idempotent and safe to re-run: it does nothing if any course row already
// uses the code.
//
// The draft has no batches, dates or price, so it cannot appear on the site
// (`isPubliclyAvailableCourse` needs a published course) and cannot be
// published as it stands: admin publishing of a batch course is blocked until
// it has at least one published batch, and certificates also need learning
// outcomes. An admin sets those, and the price, before publishing.
//
//   npx convex run bootstrapPtsdDraft:createPtsdDraft --prod

const ACTOR = "bootstrap:ptsd-draft";

const CODE = "CCPTSD";

const MODULES: { title: string; description: string }[] = [
  {
    title: "Foundations of Psychological Trauma",
    description:
      "What psychological trauma is, how the concept has developed, and the range of events and experiences it can follow.",
  },
  {
    title: "PTSD: Symptoms, Diagnostic Frameworks and Clinical Presentation",
    description:
      "The symptom clusters of PTSD as described in DSM-5-TR and ICD-11, and how presentations vary between people.",
  },
  {
    title: "Complex PTSD and Developmental Trauma",
    description:
      "How Complex PTSD is defined in ICD-11, and how prolonged or early-life trauma can affect development and relationships.",
  },
  {
    title: "Trauma, the Nervous System and Somatic Manifestations",
    description:
      "Current models of the stress response and how trauma can show up in the body, sleep, arousal and attention.",
  },
  {
    title: "Trauma-Informed Assessment and Case Formulation",
    description:
      "Principles of safe, trauma-informed assessment, commonly used measures, and building a structured case formulation.",
  },
  {
    title: "Evidence-Based Therapeutic Approaches",
    description:
      "An overview of the approaches recommended in current clinical guidelines, what each involves, and the limits of scope for practitioners in training.",
  },
  {
    title: "Practical Training: Case Analysis and Formulation",
    description:
      "Guided analysis of fictional case material, applying the assessment and formulation frameworks from earlier modules.",
  },
  {
    title: "Practical Training: Simulations, Ethical Decisions and Integration",
    description:
      "Role-play simulations, ethical decision-making exercises and a review that brings the course together.",
  },
];

export const createPtsdDraft = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Codes repeat across archived and merged copies, so check every row,
    // not just live ones, before claiming the code.
    const courses = await ctx.db.query("courses").take(2000);
    const existing = courses.find((course) => course.code === CODE);
    if (existing) {
      return { created: false, courseId: existing._id };
    }

    const now = Date.now();
    const courseId = await ctx.db.insert("courses", {
      name: "PTSD & Complex Trauma: Assessment, Formulation and Trauma-Informed Care",
      code: CODE,
      type: "certificate",
      lifecycleStatus: "draft",
      usesBatches: true,
      // `price` is required by the schema, so 0 stands in for "not set". The
      // fee has not been decided; an admin must set it before publishing.
      price: 0,
      description:
        "Draft certificate on post-traumatic stress disorder and complex trauma: assessment, case formulation and trauma-informed care. The curriculum is pending review by qualified subject-matter faculty and is not yet open for enrolment.",
      content: "",
      duration: "8 weeks (6 weeks learning + 2 weeks practical training)",
      modules: MODULES,
      enrolledUsers: [],
      reviews: [],
      createdByAdminId: ACTOR,
      updatedByAdminId: ACTOR,
      updatedAt: now,
    });

    return { created: true, courseId };
  },
});
