import { internalMutation } from "./_generated/server";
import { INTRO_QUIZ_BANK } from "./_shared/introQuizBank";
import { INTRO_ASSIGNMENT_BANK } from "./_shared/introAssignmentBank";

// Attach the four complete intro courses' recordings to the LMS and publish
// their curricula, so a paid enrollment unlocks a real, playable course.
//
//   npx convex run bootstrapIntroRecordings:seedIntroRecordings --prod
//
// Only the courses with a complete asset set are seeded (matching
// `bootstrapStorefrontPricing` and `bootstrapIntroCleanup`):
//   PRCP Criminal · PRCVCP Clinical Vs Counselling · PRSP Sports · PRPFA PFA
//
// Idempotent: a course that already has any curriculum is skipped. Videos are
// served from Google Drive; each media activity carries the module's reading
// focus as its accessible alternative. Fuller notes/transcripts can replace
// that text in /admin/lms later.

const ACTOR = "bootstrap:intro-recordings";

type ModuleSeed = {
  title: string;
  /** One-line reading focus from the reference notes. */
  focus: string;
  /** Google Drive file ids, in lesson order. */
  videos: string[];
};

type CourseSeed = {
  code: string;
  title: string;
  modules: ModuleSeed[];
};

const COURSES: CourseSeed[] = [
  {
    code: "PRCP",
    title: "Criminal Psychology",
    modules: [
      {
        title: "Understanding criminal behaviour",
        focus:
          "Compare explanations of behaviour while keeping evidence, context and legal conclusions separate.",
        // Mapping inferred: two recordings per module.
        videos: [
          "1HiyxQFAuCTBks7iSGjxlGApXAWZQ8F66",
          "10NRu5LPwbMb8TQP9VWHCLVNPuL29L4XE",
        ],
      },
      {
        title: "Criminal profiling and interviewing techniques",
        focus:
          "Understand investigative hypotheses, the risks of coercion and the value of accurate, accountable information gathering.",
        videos: [
          "1UkgE-dM81pxZeL0wKZvTnZLfJ2f4hmGv",
          "1VB1se1eQ4igOYek0Xc_dMMCOvFiMA99h",
        ],
      },
      {
        title: "Psychological assessment of offenders and accused persons",
        focus:
          "Understand assessment purposes, youth development, clinical needs and the limits of labels.",
        videos: [
          "1xnJEVD1RY_eGq4AlXHlljG3xrrl_g0Ch",
          "16qQrRFmYEkF1IuA-YXqW4Xs9ZeMoRxE8",
        ],
      },
      {
        title: "Careers, rehabilitation and restorative approaches",
        focus:
          "Explore responsible professional pathways and understand rehabilitation and restorative work without overpromising.",
        videos: [
          "158PZ0M9KhNWhFpi9sqN3d1PPe_tZ6Z1s",
          "1ultqj_Q6pCLP59Y0YpGPY2p4JssgJbs3M",
        ],
      },
    ],
  },
  {
    code: "PRCVCP",
    title: "Clinical Vs Counselling Psychology",
    modules: [
      {
        title: "Introduction to psychology professions",
        focus:
          "What the two fields study, the work they share, and why a professional title is not a complete description of competence.",
        videos: ["1nZHjh7Y6tZUTjLXoQHPRsucgUsD8wFnB"],
      },
      {
        title: "Core focus areas and work settings",
        focus:
          "Connect a person's goals to possible contributions while recognising that practical, medical and psychological support can be needed together.",
        videos: ["19nsvatfRtlNIlpVbHdBOFMXgJO6kFqlc"],
      },
      {
        title: "Core skills, techniques and assessment literacy",
        focus:
          "Understand the purpose of a skill before selecting it. A demonstration of a technique is not a complete treatment or a qualification to deliver it.",
        videos: ["1yHDQzX4dLXrAi_jSsp_tOn1umYzBlo3z"],
      },
      {
        title: "Integrated work, collaboration and training pathways",
        focus:
          "Use the integrated case to connect assessment, goals and coordination without assuming a rigid division of labour.",
        videos: ["1-AhyIPSGNP2Z_Y2WSXzMLu7C8sOKpkL8"],
      },
      {
        title: "Deciding your path",
        focus:
          "Make an evidence-informed learning decision without relying on stereotypes about status, difficulty, income or emotional demand.",
        videos: ["1lE0QGSrO8xPJ7r4vfa8gidURzqcHLN8U"],
      },
    ],
  },
  {
    code: "PRSP",
    title: "Sports Psychology",
    modules: [
      {
        title: "Introduction to sports psychology",
        focus:
          "Understand the field as a study of performance, participation and wellbeing, rather than a collection of motivational slogans.",
        videos: ["1Xg9NCzW1HvbPrSZVv9qp-C9mEDpC0TaH"],
      },
      {
        title: "Mental skills training for athletes",
        focus:
          "Learn how to describe, rehearse and review a mental skill without promising that it will guarantee performance.",
        videos: ["1ytRPHhavRs5UEoYb8AifZwKUKNgeRfiV"],
      },
      {
        title: "Attitudes to sport and sporting behaviour",
        focus:
          "Distinguish attitudes, observed behaviour and the evidence needed to explain a change.",
        videos: ["1jkWJxb3RxnzwM7XhCaEOi2dVZeMC2vlr"],
      },
      {
        title: "Team dynamics and motivation",
        focus:
          "Understand how shared tasks, relationships and communication shape participation.",
        videos: ["1tj9gC0HDV_nt--5VXa4kIs1pJq2CDTzz"],
      },
      {
        title: "Career and educational opportunities",
        focus:
          "Evaluate a pathway through actual training and role requirements rather than a list of attractive job titles.",
        videos: ["1QhLAvW3f_S3ZuBsNXTYDEaRzugGs9vO8"],
      },
      {
        title: "Alcohol and drug use among athletes",
        focus:
          "Distinguish wellbeing, medical care and anti-doping responsibilities without making unsupported prevalence claims.",
        videos: ["1nEwuLnWSudEn0igO7LTT0doBVgLazMvC"],
      },
      {
        title: "Injury and career transition",
        focus:
          "Support adjustment while keeping medical decisions, identity and personal choice in view.",
        videos: ["1PJwN_V_f2rB-SI1B94MfsQGGHN5QXGLl"],
      },
    ],
  },
  {
    code: "PRPFA",
    title: "Psychological First Aid",
    modules: [
      {
        title: "Introduction to psychological first aid",
        focus:
          "Understand the purpose, boundaries and ethical foundations of immediate, practical support.",
        // Mapping inferred: 2 / 2 / 3 across the three modules.
        videos: [
          "1UKtoL9ePrUNIqZ1eH07TBuLRT18YF-BP",
          "1twABIKJt5vRG0YoQRQu0TK7mq9HtDV0I",
        ],
      },
      {
        title: "Crisis intervention techniques within a PFA role",
        focus:
          "Recognise distress, offer proportionate support and identify when a different response is needed.",
        videos: [
          "1MLJEIcqNundh0CrCDgQPLbNSELJU4lrJ",
          "1q4jbi5BPu0Qnxm10wm-dumAyfiamVFmE",
        ],
      },
      {
        title: "Supporting people, helpers and communities",
        focus:
          "Connect individual support with access, continuity, safeguarding and organisational responsibility.",
        videos: [
          "1iPtGh9CYgEVBX4uOsbV10UfqI6Qbu3ns",
          "1n9YbZg8pHEeInIwF9lyulX3o03NHzf5y",
          "1gFXirRfwHOsiAXm5H_lDIVj3JS0w1788",
        ],
      },
    ],
  },
];

/**
 * Add one required, identified feedback activity to the end of every published
 * intro curriculum. Because it is required evidence, completion — and therefore
 * the certificate — cannot happen until the student has left feedback.
 *
 *   npx convex run bootstrapIntroRecordings:addCourseFeedback
 *
 * Idempotent: a curriculum that already has a feedback activity is skipped.
 */
export const addCourseFeedback = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const added: { code: string; activityId: string }[] = [];

    for (const seed of COURSES) {
      const matches = courses.filter((course) => course.code === seed.code);
      const course =
        matches.find((row) => row.lifecycleStatus !== "archived") ?? matches[0];
      if (!course) continue;

      const curricula = await ctx.db
        .query("lmsCurricula")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .take(100);
      const published = curricula.find((row) => row.status === "published");
      if (!published) continue;

      const activities = await ctx.db
        .query("lmsActivities")
        .withIndex("by_curriculumId", (q) =>
          q.eq("curriculumId", published._id),
        )
        .take(500);
      if (activities.some((activity) => activity.type === "feedback")) {
        continue;
      }

      const modules = await ctx.db
        .query("lmsModules")
        .withIndex("by_curriculumId_and_sortOrder", (q) =>
          q.eq("curriculumId", published._id),
        )
        .take(100);
      const lastModule = modules[modules.length - 1];
      if (!lastModule) continue;

      const activityId = await ctx.db.insert("lmsActivities", {
        curriculumId: published._id,
        moduleId: lastModule._id,
        type: "feedback",
        title: "Course feedback",
        instructions:
          "Tell us honestly how this course landed for you — what worked, what didn't, and what would make it better. Your feedback is required before your certificate is issued, and it helps us improve the next cohort.",
        required: true,
        sortOrder: 90,
        releaseMode: "immediate",
        completionMode: "submit",
        feedbackMode: "identified",
        rightsApproved: true,
        createdAt: now,
        updatedAt: now,
      });
      added.push({ code: seed.code, activityId });
    }

    return { added };
  },
});

/**
 * Load the workbook quizzes into each module's quiz activity, then mark the
 * quiz required with a 70% pass mark. This is what lets a student actually
 * complete a course — and therefore reach the certificate.
 *
 *   npx convex run bootstrapIntroRecordings:loadIntroQuizzes
 *
 * Idempotent: a quiz activity that already has questions is skipped.
 */
export const loadIntroQuizzes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const results: {
      code: string;
      quizzesFilled?: number;
      questions?: number;
      skippedWithQuestions?: number;
      skipped?: string;
    }[] = [];

    for (const seed of COURSES) {
      const bank = INTRO_QUIZ_BANK[seed.code];
      if (!bank) continue;

      const matches = courses.filter((course) => course.code === seed.code);
      const course =
        matches.find((row) => row.lifecycleStatus !== "archived") ?? matches[0];
      if (!course) continue;

      const curricula = await ctx.db
        .query("lmsCurricula")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .take(100);
      const published = curricula.find((row) => row.status === "published");
      if (!published) {
        results.push({ code: seed.code, skipped: "no published curriculum" });
        continue;
      }

      const modules = await ctx.db
        .query("lmsModules")
        .withIndex("by_curriculumId_and_sortOrder", (q) =>
          q.eq("curriculumId", published._id),
        )
        .take(100);
      const activities = await ctx.db
        .query("lmsActivities")
        .withIndex("by_curriculumId", (q) =>
          q.eq("curriculumId", published._id),
        )
        .take(500);

      let quizzesFilled = 0;
      let questionsLoaded = 0;
      let skippedWithQuestions = 0;

      const orderedModules = [...modules].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      );

      for (
        let moduleIndex = 0;
        moduleIndex < orderedModules.length;
        moduleIndex += 1
      ) {
        const module = orderedModules[moduleIndex];
        // Modules are seeded in the workbook's order, so module N maps to the
        // Nth bank entry.
        const bankModule = bank[moduleIndex];
        if (!bankModule) continue;

        const quiz = activities.find(
          (activity) =>
            activity.moduleId === module._id && activity.type === "quiz",
        );
        if (!quiz) continue;

        const existingQuestions = await ctx.db
          .query("lmsQuizQuestions")
          .withIndex("by_activityId_and_sortOrder", (q) =>
            q.eq("activityId", quiz._id),
          )
          .take(1);
        if (existingQuestions.length > 0) {
          skippedWithQuestions += 1;
          continue;
        }

        for (let index = 0; index < bankModule.questions.length; index += 1) {
          const question = bankModule.questions[index];
          const questionId = await ctx.db.insert("lmsQuizQuestions", {
            activityId: quiz._id,
            prompt: question.prompt,
            sortOrder: index,
            createdAt: now,
            updatedAt: now,
          });
          for (
            let optionIndex = 0;
            optionIndex < question.options.length;
            optionIndex += 1
          ) {
            const option = question.options[optionIndex];
            await ctx.db.insert("lmsQuizOptions", {
              questionId,
              label: option.label,
              sortOrder: optionIndex,
              isCorrect: option.correct,
              createdAt: now,
            });
          }
          questionsLoaded += 1;
        }

        await ctx.db.patch(quiz._id, {
          required: true,
          passingScore: 70,
          updatedAt: now,
        });
        quizzesFilled += 1;
      }

      if (quizzesFilled > 0) {
        await ctx.db.patch(published._id, { updatedAt: now });
      }
      results.push({
        code: seed.code,
        quizzesFilled,
        questions: questionsLoaded,
        skippedWithQuestions,
      });
    }

    return { results };
  },
});

/**
 * Remove quiz questions that have no options — the residue of an earlier
 * import. Safe: it only deletes a question with zero options, which could never
 * be answered anyway.
 *
 *   npx convex run bootstrapIntroRecordings:removeEmptyQuizQuestions
 */
export const removeEmptyQuizQuestions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("lmsQuizQuestions").take(2000);
    let removed = 0;
    for (const question of questions) {
      const options = await ctx.db
        .query("lmsQuizOptions")
        .withIndex("by_questionId_and_sortOrder", (q) =>
          q.eq("questionId", question._id),
        )
        .take(1);
      if (options.length === 0) {
        await ctx.db.delete(question._id);
        removed += 1;
      }
    }
    return { removed };
  },
});

/**
 * Remove quiz questions that have no options, together with their activity's
 * other questions, so a partial import can be retried cleanly. Only touches
 * quizzes whose questions are incomplete.
 *
 *   npx convex run bootstrapIntroRecordings:resetIncompleteQuizzes
 */
export const resetIncompleteQuizzes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("lmsQuizQuestions").take(2000);
    const activityIds = [...new Set(questions.map((row) => row.activityId))];
    let removedQuestions = 0;
    let resetActivities = 0;

    for (const activityId of activityIds) {
      const rows = questions.filter((row) => row.activityId === activityId);
      const withOptions = new Set<string>();
      for (const row of rows) {
        const options = await ctx.db
          .query("lmsQuizOptions")
          .withIndex("by_questionId_and_sortOrder", (q) =>
            q.eq("questionId", row._id),
          )
          .take(4);
        if (options.length > 0) withOptions.add(row._id);
      }
      // Complete quiz: every question has options. Leave it alone.
      if (withOptions.size === rows.length && rows.length > 0) continue;

      for (const row of rows) {
        const options = await ctx.db
          .query("lmsQuizOptions")
          .withIndex("by_questionId_and_sortOrder", (q) =>
            q.eq("questionId", row._id),
          )
          .take(10);
        for (const option of options) {
          await ctx.db.delete(option._id);
        }
        await ctx.db.delete(row._id);
        removedQuestions += 1;
      }
      resetActivities += 1;
    }

    return { removedQuestions, resetActivities };
  },
});

/**
 * Add one assignment per module from the practice workbook's fictional case, so
 * learners write and submit their reasoning for Faculty review. Assignment
 * activities are optional evidence (they do not gate the certificate), but they
 * link the workbook into the LMS.
 *
 *   npx convex run bootstrapIntroRecordings:loadIntroAssignments
 *
 * Idempotent: a module that already has an assignment is skipped.
 */
export const loadIntroAssignments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const results: { code: string; assignments?: number; skipped?: string }[] =
      [];

    for (const seed of COURSES) {
      const bank = INTRO_ASSIGNMENT_BANK[seed.code];
      if (!bank) continue;

      const matches = courses.filter((course) => course.code === seed.code);
      const course =
        matches.find((row) => row.lifecycleStatus !== "archived") ?? matches[0];
      if (!course) continue;

      const curricula = await ctx.db
        .query("lmsCurricula")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .take(100);
      const published = curricula.find((row) => row.status === "published");
      if (!published) {
        results.push({ code: seed.code, skipped: "no published curriculum" });
        continue;
      }

      const modules = await ctx.db
        .query("lmsModules")
        .withIndex("by_curriculumId_and_sortOrder", (q) =>
          q.eq("curriculumId", published._id),
        )
        .take(100);
      const activities = await ctx.db
        .query("lmsActivities")
        .withIndex("by_curriculumId", (q) =>
          q.eq("curriculumId", published._id),
        )
        .take(500);

      const orderedModules = [...modules].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      );
      let assignments = 0;

      for (
        let moduleIndex = 0;
        moduleIndex < orderedModules.length;
        moduleIndex += 1
      ) {
        const module = orderedModules[moduleIndex];
        const bankModule = bank[moduleIndex];
        if (!bankModule) continue;
        if (
          activities.some(
            (activity) =>
              activity.moduleId === module._id &&
              activity.type === "assignment",
          )
        ) {
          continue;
        }

        const taskList = bankModule.tasks
          .map((task, index) => `${index + 1}. ${task}`)
          .join("\n");

        await ctx.db.insert("lmsActivities", {
          curriculumId: published._id,
          moduleId: module._id,
          type: "assignment",
          title: `${module.title} — practice task`,
          instructions: [
            bankModule.caseBrief,
            "",
            "Complete the following tasks and submit your response:",
            taskList,
            "",
            "Your submission is reviewed by Faculty. Reference the module notes and show your reasoning; where information is missing, say what you would check and why.",
          ].join("\n"),
          required: false,
          sortOrder: 80,
          releaseMode: "immediate",
          completionMode: "submit",
          gradingCriteria:
            "A complete response separates observation from inference, uses the module's concepts correctly, asks proportionate questions, and states an appropriate limit on the learner's role. Partial credit for a clear plan where information is missing.",
          rightsApproved: true,
          createdAt: now,
          updatedAt: now,
        });
        assignments += 1;
      }

      if (assignments > 0) {
        await ctx.db.patch(published._id, { updatedAt: now });
      }
      results.push({ code: seed.code, assignments });
    }

    return { results };
  },
});

/**
 * Publish and price the four complete intros at ₹999. Narrow on purpose: it
 * touches only these four courses, so it cannot alter certificate prices or
 * clear a live offer the way the full storefront pricing seed would.
 */
export const publishCompleteIntros = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const updated: { code: string; name: string }[] = [];

    for (const seed of COURSES) {
      const matches = courses.filter((course) => course.code === seed.code);
      const course =
        matches.find((row) => row.lifecycleStatus !== "archived") ?? matches[0];
      if (!course) continue;

      await ctx.db.patch(course._id, {
        price: 999,
        usesBatches: false,
        lifecycleStatus: "published",
        publishedAt: course.publishedAt ?? now,
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
      updated.push({ code: seed.code, name: course.name });
    }

    return { updated };
  },
});

/**
 * Create the Psychological First Aid intro course, which exists as notes and
 * recordings but had no catalogue row. Safe and idempotent: if the course
 * already exists it is published at ₹999 and left otherwise untouched.
 *
 *   npx convex run bootstrapIntroRecordings:createPsychologicalFirstAid
 */
export const createPsychologicalFirstAid = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const existing = courses.find(
      (course) =>
        course.code === "PRPFA" ||
        course.name.toLowerCase().includes("psychological first aid"),
    );

    if (existing) {
      await ctx.db.patch(existing._id, {
        code: existing.code ?? "PRPFA",
        price: 999,
        usesBatches: false,
        lifecycleStatus: "published",
        publishedAt: existing.publishedAt ?? now,
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
      return { created: false, courseId: existing._id };
    }

    const courseId = await ctx.db.insert("courses", {
      name: "Psychological First Aid",
      code: "PRPFA",
      type: "pre-recorded",
      price: 999,
      lifecycleStatus: "published",
      usesBatches: false,
      description:
        "Three recorded modules on respectful first contact, practical support and coordinated next steps. Learn what immediate, non-clinical help looks like, how to recognise when a different response is needed, and how to link people to ongoing support with dignity.",
      content:
        "psychological first aid PFA look listen link crisis support respectful first contact practical support referral safeguarding community resilience helper stress non-clinical immediate support",
      imageUrls: ["/coastal/shore.jpg"],
      learningOutcomes: [
        {
          icon: "shield",
          title: "What psychological first aid is — and is not",
        },
        { icon: "eye", title: "Look: safety and immediate priorities" },
        { icon: "ear", title: "Listen: respectful contact and present needs" },
        { icon: "link", title: "Link: practical support and continuity" },
        {
          icon: "users",
          title: "Supporting children, older adults and communities",
        },
        { icon: "heart", title: "Helper stress and organisational support" },
      ],
      modules: [
        {
          title: "Introduction to psychological first aid",
          description:
            "Purpose, boundaries and the ethical foundations of immediate, practical support.",
        },
        {
          title: "Crisis intervention techniques within a PFA role",
          description:
            "Recognising distress, offering proportionate support and knowing when a different response is needed.",
        },
        {
          title: "Supporting people, helpers and communities",
          description:
            "Access, continuity, safeguarding and organisational responsibility after the first contact.",
        },
      ],
      outcomes: [
        "Describe what psychological first aid covers and where it stops",
        "Prepare for first contact before it happens",
        "Offer respectful, proportionate support using Look, Listen and Link",
        "Recognise when urgent or clinical care is the right referral",
        "Support helpers, families and communities with continuity in mind",
      ],
      painPoints: [
        "Not knowing what to say to someone in distress",
        "Worrying about saying the wrong thing",
        "Confusing first aid with counselling or therapy",
        "Unsure when to escalate or refer on",
      ],
      whyDifferent: [
        "Evidence-informed and honest about scope",
        "Practical, worked case studies, not slogans",
        "Clear escalation and referral boundaries",
      ],
      prerequisites: "None. No prior psychology study is required.",
      enrolledUsers: [],
      reviews: [],
      publishedAt: now,
      updatedAt: now,
      createdByAdminId: ACTOR,
      updatedByAdminId: ACTOR,
    });

    return { created: true, courseId };
  },
});

export const seedIntroRecordings = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const results: {
      code: string;
      curriculumId?: string;
      modules?: number;
      videos?: number;
      skipped?: string;
    }[] = [];

    for (const seed of COURSES) {
      const matches = courses.filter((course) => course.code === seed.code);
      const course =
        matches.find((row) => row.lifecycleStatus !== "archived") ?? matches[0];
      if (!course) {
        results.push({ code: seed.code, skipped: "course not found" });
        continue;
      }

      const existing = await ctx.db
        .query("lmsCurricula")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .take(100);
      if (existing.length > 0) {
        results.push({ code: seed.code, skipped: "curriculum already exists" });
        continue;
      }

      const curriculumId = await ctx.db.insert("lmsCurricula", {
        courseId: course._id,
        version: 1,
        title: seed.title,
        status: "published",
        createdByAdminId: ACTOR,
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      });

      let videos = 0;
      for (let index = 0; index < seed.modules.length; index += 1) {
        const module = seed.modules[index];
        const moduleId = await ctx.db.insert("lmsModules", {
          curriculumId,
          title: module.title,
          sortOrder: index,
          createdAt: now,
          updatedAt: now,
        });

        await ctx.db.insert("lmsActivities", {
          curriculumId,
          moduleId,
          type: "reading",
          title: `${module.title} — reading`,
          content: module.focus,
          instructions:
            "Read the reference notes for this module, then mark the reading complete.",
          required: true,
          sortOrder: 0,
          releaseMode: "immediate",
          completionMode: "self_confirm",
          rightsApproved: true,
          createdAt: now,
          updatedAt: now,
        });

        for (
          let videoIndex = 0;
          videoIndex < module.videos.length;
          videoIndex += 1
        ) {
          const driveId = module.videos[videoIndex];
          await ctx.db.insert("lmsActivities", {
            curriculumId,
            moduleId,
            type: "media",
            title:
              module.videos.length > 1
                ? `${module.title} — video ${videoIndex + 1}`
                : `${module.title} — video`,
            instructions: module.focus,
            externalUrl: `https://drive.google.com/file/d/${driveId}/view`,
            required: false,
            sortOrder: 1 + videoIndex,
            releaseMode: "immediate",
            completionMode: "self_confirm",
            rightsApproved: true,
            accessibleAlternative: `${module.focus} Full reference notes travel with the course (module: ${module.title}).`,
            createdAt: now,
            updatedAt: now,
          });
          videos += 1;
        }

        await ctx.db.insert("lmsActivities", {
          curriculumId,
          moduleId,
          type: "quiz",
          title: `${module.title} — knowledge check`,
          instructions:
            "Five-question module quiz from the practice workbook. Add the questions, then mark this activity required.",
          required: false,
          sortOrder: 10,
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
        code: seed.code,
        curriculumId,
        modules: seed.modules.length,
        videos,
      });
    }

    return { curricula: results };
  },
});
