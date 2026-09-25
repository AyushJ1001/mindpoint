import { internalMutation } from "./_generated/server";

// Scaffolds draft LMS curricula for the four self-paced courses so the owner
// only has to paste reading notes, upload videos and write quiz questions.
//
// For every lesson it creates three activities: a Reading (required), a Media
// video (upload/link to fill), and a Knowledge check quiz (pass 70%, add
// questions then mark required).
//
//   npx convex run bootstrapLmsCurricula:scaffoldSelfPacedCurricula --prod
//
// Idempotent: a course that already has any curriculum is skipped.

const ACTOR = "bootstrap:lms-curricula";

const PLANS: { code: string; title: string; modules: string[] }[] = [
  {
    code: "PRCBTI",
    title: "Introduction to CBT, REBT and CBMT",
    modules: [
      "A shared language for studying psychology",
      "Where CBT, REBT and CBMT came from",
      "Understanding the cognitive behavioural cycle",
      "Automatic thoughts and deeper beliefs",
      "Emotion, behaviour and learning",
      "REBT beliefs and the ABCDE map",
      "Cognitive behaviour modification and coping dialogue",
      "Bringing the foundations together",
    ],
  },
  {
    code: "PRPDI",
    title: "Introduction to Personality Disorders",
    modules: [
      "What personality disorders are — and are not",
      "How the categories are organised",
      "Cluster A: odd and eccentric",
      "Cluster B: dramatic and emotional",
      "Cluster C: anxious and fearful",
      "Stigma, language and the person in front of you",
      "From labels to formulation",
      "Bringing the foundations together",
    ],
  },
  {
    code: "PRICHI",
    title: "Introduction to Inner Child Healing",
    modules: [
      "What we mean by the inner child",
      "How childhood shapes adult life",
      "Attachment and relational patterns",
      "Self-compassion without self-indulgence",
      "Nurturing and validating",
      "Expressive and creative approaches",
      "Grief, anger, forgiveness and pace",
      "Bringing the foundations together",
    ],
  },
  {
    code: "PRCVCP",
    title: "Clinical Vs Counselling Psychology",
    modules: [
      "Clinical versus counselling psychology",
      "What counselling can and cannot help with",
      "The counselling relationship",
      "Scope, ethics and referral",
    ],
  },
];

export const scaffoldSelfPacedCurricula = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const results: {
      code: string;
      curriculumId?: string;
      modules?: number;
      skipped?: string;
    }[] = [];

    for (const plan of PLANS) {
      const matches = courses.filter((course) => course.code === plan.code);
      const course =
        matches.find((row) => row.lifecycleStatus !== "archived") ?? matches[0];
      if (!course) {
        results.push({ code: plan.code, skipped: "course not found" });
        continue;
      }

      const existing = await ctx.db
        .query("lmsCurricula")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .take(100);
      if (existing.length > 0) {
        results.push({ code: plan.code, skipped: "curriculum already exists" });
        continue;
      }

      const curriculumId = await ctx.db.insert("lmsCurricula", {
        courseId: course._id,
        version: 1,
        title: plan.title,
        status: "draft",
        createdByAdminId: ACTOR,
        createdAt: now,
        updatedAt: now,
      });

      for (let index = 0; index < plan.modules.length; index += 1) {
        const moduleTitle = plan.modules[index];
        const moduleId = await ctx.db.insert("lmsModules", {
          curriculumId,
          title: moduleTitle,
          sortOrder: index,
          createdAt: now,
          updatedAt: now,
        });

        // 1. Reading — paste the notes (or attach a PDF) into content.
        await ctx.db.insert("lmsActivities", {
          curriculumId,
          moduleId,
          type: "reading",
          title: `${moduleTitle} — reading`,
          instructions:
            "Paste the lesson reading notes into the content field, or attach the PDF to this module.",
          required: true,
          sortOrder: 0,
          releaseMode: "immediate",
          completionMode: "self_confirm",
          rightsApproved: true,
          createdAt: now,
          updatedAt: now,
        });

        // 2. Media — upload the recording (≤256MB) or paste an HTTPS link.
        await ctx.db.insert("lmsActivities", {
          curriculumId,
          moduleId,
          type: "media",
          title: `${moduleTitle} — video`,
          instructions:
            "Upload the recorded lesson (up to 256MB) or paste an HTTPS link, then tick Rights approval and add an accessible alternative.",
          required: false,
          sortOrder: 1,
          releaseMode: "immediate",
          completionMode: "self_confirm",
          rightsApproved: false,
          accessibleAlternative:
            "Add a transcript or a written summary of this lesson.",
          createdAt: now,
          updatedAt: now,
        });

        // 3. Knowledge check — add questions, then mark required.
        await ctx.db.insert("lmsActivities", {
          curriculumId,
          moduleId,
          type: "quiz",
          title: `${moduleTitle} — knowledge check`,
          instructions:
            "Add 3–5 questions with one correct answer each, then switch this activity to required.",
          required: false,
          sortOrder: 2,
          releaseMode: "immediate",
          completionMode: "pass",
          passingScore: 70,
          rightsApproved: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      await ctx.db.patch(curriculumId, { updatedAt: now });
      results.push({
        code: plan.code,
        curriculumId,
        modules: plan.modules.length,
      });
    }

    return { curricula: results };
  },
});
