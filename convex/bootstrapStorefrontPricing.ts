import { internalMutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Storefront pricing bootstrap (owner decision, September 2026).
//
// Applied certificate courses become ₹3,499; their self-paced introduction
// stays ₹1,499. The Counselling Psychology internship is ₹2,499 with a ₹999
// self-paced route, which reuses the existing "Clinical Vs Counselling
// Psychology" pre-recorded course. Every other published pre-recorded course
// in the standalone library drops to ₹999.
//
// Promotional offers (percentage / BOGO) are cleared on every course this file
// touches, so the price shown is the price paid.
//
// Run once against a deployment:
//   npx convex run bootstrapStorefrontPricing:applyStorefrontPricing --prod
//
// Idempotent: courses are matched by code (preferring the non-archived row),
// intros are matched by code or name, and existing rows are patched.

const CERT_APPLIED_PRICE = 3499;
const CERT_INTRO_PRICE = 1499;
const COUNSELLING_APPLIED_PRICE = 2499;
const SELF_PACED_LIBRARY_PRICE = 999;

const ACTOR = "bootstrap:storefront-pricing";

type AppliedSeed = { code: string; name: string; match: string };

const APPLIED_CERTIFICATES: AppliedSeed[] = [
  { code: "CCCBT", name: "CBT, REBT and CBMT", match: "cbmt" },
  {
    code: "CCICH",
    name: "Inner Child Healing & Therapy",
    match: "inner child",
  },
  {
    code: "CCPD",
    name: "Personality Disorders",
    match: "personality disorder",
  },
];

const COUNSELLING_APPLIED: AppliedSeed = {
  code: "INCLP",
  name: "Counselling Psychology",
  match: "counselling psychology",
};

// Published standalone library titles that become ₹999 self-paced intros.
const SELF_PACED_LIBRARY_CODES = ["PRCVCP", "PRFP", "PRCP", "PRSP", "PRDSM5"];

type IntroSeed = {
  code: string;
  name: string;
  match: string;
  description: string;
  searchText: string;
  imageUrls: string[];
  learningOutcomes: { icon: string; title: string }[];
  modules: { title: string; description: string }[];
  outcomes: string[];
  painPoints: string[];
  whyDifferent: string[];
};

const INTROS: IntroSeed[] = [
  {
    code: "PRCBTI",
    name: "Introduction to CBT, REBT and CBMT",
    match: "introduction to cbt",
    description:
      "Eight recorded lessons that make the vocabulary, history and central ideas of CBT, REBT and CBMT understandable even if psychology is new to you, with substantial reading notes and reflection questions.",
    searchText:
      "Introduction to CBT REBT CBMT self-paced recorded lessons foundations cognitive behaviour modification therapy",
    imageUrls: ["/coastal/calm.jpg"],
    learningOutcomes: [
      {
        icon: "message-circle",
        title: "A shared language for studying psychology",
      },
      { icon: "history", title: "Where CBT, REBT and CBMT came from" },
      {
        icon: "refresh",
        title: "Understanding the cognitive behavioural cycle",
      },
      { icon: "search", title: "Automatic thoughts and deeper beliefs" },
      { icon: "activity", title: "Emotion, behaviour and learning" },
      { icon: "clipboard", title: "REBT beliefs and the ABCDE map" },
      {
        icon: "brain",
        title: "Cognitive behaviour modification and coping dialogue",
      },
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
  },
  {
    code: "PRPDI",
    name: "Introduction to Personality Disorders",
    match: "introduction to personality disorders",
    description:
      "Eight recorded lessons that introduce personality disorders honestly: how the categories developed, what the clusters describe, why labels carry stigma, and how practitioners build understanding without reducing a person to a diagnosis.",
    searchText:
      "Introduction to personality disorders self-paced recorded lessons clusters stigma formulation DSM ICD foundations",
    imageUrls: ["/coastal/shore.jpg"],
    learningOutcomes: [
      { icon: "book-open", title: "How the categories developed" },
      { icon: "layers", title: "What the clusters describe" },
      { icon: "search", title: "Why labels carry stigma" },
      {
        icon: "clipboard",
        title: "The difference between a trait and a disorder",
      },
      {
        icon: "heart-handshake",
        title: "Building understanding without judgement",
      },
      { icon: "activity", title: "Where support and therapy begin" },
      { icon: "shield", title: "Scope, consent and referral" },
      { icon: "refresh", title: "Bringing the foundations together" },
    ],
    modules: [
      {
        title: "What personality disorders are — and are not",
        description:
          "How the idea took shape, what a personality trait is, and when a lasting pattern is treated as a disorder.",
      },
      {
        title: "How the categories are organised",
        description:
          "The DSM and ICD approaches, the cluster idea, and the ongoing debate about categorical versus dimensional models.",
      },
      {
        title: "Cluster A: odd and eccentric",
        description:
          "An introduction to paranoid, schizoid and schizotypal presentations, described plainly and without caricature.",
      },
      {
        title: "Cluster B: dramatic and emotional",
        description:
          "Borderline, narcissistic, histrionic and antisocial presentations, and the stigma that surrounds these labels.",
      },
      {
        title: "Cluster C: anxious and fearful",
        description:
          "Avoidant, dependent and obsessive-compulsive presentations, and how anxiety shapes daily life.",
      },
      {
        title: "Stigma, language and the person in front of you",
        description:
          "Why diagnostic language can harm, how to talk about patterns respectfully, and what a label can and cannot tell you.",
      },
      {
        title: "From labels to formulation",
        description:
          "The idea that understanding a person requires their history, context and strengths, not only a category.",
      },
      {
        title: "Bringing the foundations together",
        description:
          "Use a fictional case to separate observation, inference and stigma, and prepare for the applied live stage.",
      },
    ],
    outcomes: [
      "You can explain the clusters in plain language.",
      "You can describe the difference between a trait and a disorder.",
      "You recognise stigma and can avoid reinforcing it.",
      "You understand why formulation matters.",
      "You are ready for the applied live stage.",
    ],
    painPoints: [
      "Personality disorders are widely misunderstood and stigmatised.",
      "Most introductions stop at labels and never cover the person.",
      "You want an honest foundation before you commit to live classes.",
    ],
    whyDifferent: [
      "A trauma-informed, non-stigmatising stance throughout.",
      "Substantial student reading notes, not a slide deck.",
      "Fictional cases and reflection questions throughout.",
      "A clear route into the applied live course.",
    ],
  },
  {
    code: "PRICHI",
    name: "Introduction to Inner Child Healing",
    match: "introduction to inner child",
    description:
      "Eight recorded lessons that introduce inner child work gently and responsibly: how childhood experience shapes adult patterns, what self-compassion means in practice, and how to stay trauma-informed.",
    searchText:
      "Introduction to inner child healing self-paced recorded lessons trauma informed self compassion attachment foundations",
    imageUrls: ["/coastal/calm.jpg"],
    learningOutcomes: [
      { icon: "history", title: "Where the inner child idea came from" },
      { icon: "heart", title: "How early experience shapes adult patterns" },
      {
        icon: "search",
        title: "Recognising attachment and relational patterns",
      },
      { icon: "sparkles", title: "What self-compassion means in practice" },
      { icon: "hands", title: "Nurturing and comforting as skills" },
      { icon: "clipboard", title: "Working with grief, anger and forgiveness" },
      { icon: "shield", title: "Staying trauma-informed and within scope" },
      { icon: "layers", title: "Bringing the foundations together" },
    ],
    modules: [
      {
        title: "What we mean by the inner child",
        description:
          "Where the idea came from, what it is useful for, and what it is not — including the limits of metaphor.",
      },
      {
        title: "How childhood shapes adult life",
        description:
          "An introduction to how early relationships and experiences influence beliefs, expectations and responses.",
      },
      {
        title: "Attachment and relational patterns",
        description:
          "The idea of attachment styles, how patterns repeat, and why they are not a fixed verdict on a person.",
      },
      {
        title: "Self-compassion without self-indulgence",
        description:
          "What self-compassion actually involves, common misunderstandings, and simple practices that build it.",
      },
      {
        title: "Nurturing and validating",
        description:
          "Practical, gentle ways to offer care and comfort, and why rushing someone is counterproductive.",
      },
      {
        title: "Expressive and creative approaches",
        description:
          "An introduction to guided visualisation, writing and expressive arts, with clear caveats.",
      },
      {
        title: "Grief, anger, forgiveness and pace",
        description:
          "Why these themes deserve care, and why forgiveness is never something to force.",
      },
      {
        title: "Bringing the foundations together",
        description:
          "Reflect on a fictional case and prepare for the applied live stage, staying within your scope.",
      },
    ],
    outcomes: [
      "You can explain inner child work without jargon.",
      "You can recognise childhood patterns in adult life.",
      "You understand self-compassion in practice.",
      "You know why pace and safety matter.",
      "You are ready for the applied live stage.",
    ],
    painPoints: [
      "Inner child work is often taught as vague, feel-good content.",
      "Most introductions skip the trauma-informed cautions.",
      "You want a grounded foundation before live classes.",
    ],
    whyDifferent: [
      "Trauma-informed and grounded, not vague.",
      "Substantial student reading notes, not a slide deck.",
      "Fictional cases and reflection prompts throughout.",
      "A clear route into the applied live course.",
    ],
  },
];

function pickCourse(
  courses: Doc<"courses">[],
  code: string,
): Doc<"courses"> | undefined {
  const matches = courses.filter((course) => course.code === code);
  if (matches.length <= 1) return matches[0];
  // Prefer the live row over an archived duplicate.
  return (
    matches.find((course) => course.lifecycleStatus !== "archived") ??
    matches[0]
  );
}

export const applyStorefrontPricing = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const results: {
      code: string;
      name: string;
      courseId: Id<"courses"> | null;
      price: number;
      created: boolean;
    }[] = [];

    const setPrice = async (
      seed: { code: string; name: string },
      price: number,
      usesBatches: boolean,
    ) => {
      const existing = pickCourse(courses, seed.code);
      if (!existing) {
        results.push({
          code: seed.code,
          name: seed.name,
          courseId: null,
          price,
          created: false,
        });
        return;
      }
      await ctx.db.patch(existing._id, {
        price,
        usesBatches,
        lifecycleStatus: "published",
        offer: undefined,
        bogo: undefined,
        publishedAt: existing.publishedAt ?? now,
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
      results.push({
        code: seed.code,
        name: existing.name,
        courseId: existing._id,
        price,
        created: false,
      });
    };

    // ── Applied certificate courses → ₹3,499 ─────────────────────────
    for (const seed of APPLIED_CERTIFICATES) {
      await setPrice(seed, CERT_APPLIED_PRICE, true);
    }

    // ── Counselling Psychology internship → ₹2,499 ───────────────────
    await setPrice(COUNSELLING_APPLIED, COUNSELLING_APPLIED_PRICE, true);

    // ── Self-paced introductions → ₹1,499 (create if missing) ────────
    for (const seed of INTROS) {
      const existing =
        pickCourse(courses, seed.code) ??
        courses.find(
          (course) => course.name.toLowerCase() === seed.name.toLowerCase(),
        );

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: seed.name,
          price: CERT_INTRO_PRICE,
          usesBatches: false,
          lifecycleStatus: "published",
          offer: undefined,
          bogo: undefined,
          publishedAt: existing.publishedAt ?? now,
          updatedAt: now,
          updatedByAdminId: ACTOR,
        });
        results.push({
          code: seed.code,
          name: seed.name,
          courseId: existing._id,
          price: CERT_INTRO_PRICE,
          created: false,
        });
        continue;
      }

      const courseId = await ctx.db.insert("courses", {
        name: seed.name,
        code: seed.code,
        type: "pre-recorded",
        price: CERT_INTRO_PRICE,
        lifecycleStatus: "published",
        usesBatches: false,
        description: seed.description,
        content: seed.searchText,
        imageUrls: seed.imageUrls,
        learningOutcomes: seed.learningOutcomes,
        modules: seed.modules,
        outcomes: seed.outcomes,
        painPoints: seed.painPoints,
        whyDifferent: seed.whyDifferent,
        prerequisites: "None. No prior psychology study is required.",
        enrolledUsers: [],
        reviews: [],
        publishedAt: now,
        updatedAt: now,
        createdByAdminId: ACTOR,
        updatedByAdminId: ACTOR,
      });
      results.push({
        code: seed.code,
        name: seed.name,
        courseId,
        price: CERT_INTRO_PRICE,
        created: true,
      });
    }

    // ── Standalone pre-recorded library → ₹999 ───────────────────────
    for (const code of SELF_PACED_LIBRARY_CODES) {
      const existing = pickCourse(courses, code);
      if (!existing) continue;
      await ctx.db.patch(existing._id, {
        price: SELF_PACED_LIBRARY_PRICE,
        usesBatches: false,
        lifecycleStatus: "published",
        offer: undefined,
        bogo: undefined,
        publishedAt: existing.publishedAt ?? now,
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
      results.push({
        code,
        name: existing.name,
        courseId: existing._id,
        price: SELF_PACED_LIBRARY_PRICE,
        created: false,
      });
    }

    // ── Counselling January cohort → 18 Jan – 17 Feb 2027 (14 classes) ─
    let counsellingBatchUpdated = false;
    const counselling = pickCourse(courses, COUNSELLING_APPLIED.code);
    if (counselling) {
      const batches = await ctx.db
        .query("courseBatches")
        .withIndex("by_courseId", (q) => q.eq("courseId", counselling._id))
        .collect();
      const january = batches.find(
        (batch) => batch.label === "January 2027 Batch",
      );
      if (january) {
        await ctx.db.patch(january._id, {
          startDate: "2027-01-18",
          endDate: "2027-02-17",
          startTime: "19:30",
          endTime: "20:30",
          daysOfWeek: ["Monday", "Wednesday", "Friday"],
          lifecycleStatus: "published",
          updatedAt: now,
          updatedByAdminId: ACTOR,
        });
        counsellingBatchUpdated = true;
      }
    }

    return { pricing: results, counsellingBatchUpdated };
  },
});
