import type { CourseContent } from "@/lib/course-content/types";

/**
 * Inner Child Healing & Therapy — programme page content.
 *
 * Operational facts (price, dates, seats, faculty, checkout URLs) come from the
 * programme catalogue via `catalogueCode`; unconfigured fields are omitted
 * rather than guessed.
 */
export const innerChildHealing: CourseContent = {
  slug: "inner-child-healing",
  title: "Inner Child Healing & Therapy",
  shortTitle: "Inner Child Healing",
  category: "Certificate course",
  tagline:
    "Understand what we carry. Explore where it began. Learn healthier ways of responding today.",
  description:
    "A two-stage certificate course: a self-paced introduction, then live applied classes working gently and responsibly with childhood patterns.",
  heroCopy:
    "Understand what we carry. Explore where it began. Learn healthier ways of responding today.",
  learningOutcomes: [
    "Explain what inner child work means, where the idea came from and what it is useful for.",
    "Describe how early relationships and experiences can shape adult beliefs, expectations and responses.",
    "Recognise attachment and relational patterns without treating them as a fixed verdict on a person.",
    "Practise self-compassion and explain why it is not self-indulgence.",
    "Use simple, safe nurturing and expressive practices, and know when not to.",
    "Work with grief, anger and forgiveness at a pace a person can carry.",
    "Stay trauma-informed, recognise your scope, and refer on when a situation needs more.",
  ],
  audience: [],
  prerequisites: [],
  partOne: {
    title: "Part I — Foundations",
    subtitle: "Introductory self-paced course",
    formats: [],
    modules: [],
    assessment: undefined,
  },
  partTwo: {
    title: "Part II — Applied",
    subtitle: "Applied live course",
    formats: [],
    sessions: [],
    assessment: undefined,
  },
  caseRoom: [],
  toolkit: [],
  faculty: [],
  duration: undefined,
  weeklyCommitment: undefined,
  selfPacedStart: undefined,
  liveStart: undefined,
  liveEnd: undefined,
  cohortSize: undefined,
  certificateFoundation: undefined,
  certificateComplete: undefined,
  pricing: {
    foundation: {
      name: "Introductory self-paced course",
      description: "Self-paced introduction.",
      includes: [],
    },
    complete: {
      name: "Applied live course",
      description: "Live applied classes.",
      includes: [],
      primary: true,
    },
  },
  faq: [
    {
      question: "Do I need a psychology background?",
      answer:
        "No prior psychology study is required for the introductory self-paced stage. It begins with ordinary experience and defines each idea before using it.",
    },
    {
      question: "Is this personal therapy?",
      answer:
        "No. This is educational training. You will study ideas and practise with fictional cases and reflective exercises, but the course is not a substitute for your own therapy where you want it.",
    },
    {
      question: "Will I have to disclose personal material?",
      answer:
        "No. Personal reflection is optional. The teaching uses fictional cases and structured prompts so that nobody is expected to share private history in a group.",
    },
    {
      question: "Is the applied stage recorded?",
      answer:
        "The applied stage is taught live. Replay access is only offered if the specific cohort includes recordings and The Mind Point has approved that benefit.",
    },
    {
      question: "Does this make me a therapist?",
      answer:
        "No. It builds understanding and skill, but it is not a degree or a licence, and it does not qualify you to practise independently where local law requires registration.",
    },
    {
      question: "How do I know the price, dates and certificate requirements?",
      answer:
        "These are shown from the current enrolment option and cohort details on the page and at checkout. This course description is not a substitute for those live details.",
    },
  ],
  disclaimer:
    "Educational certificate course. This programme is not personal therapy and does not confer an independent clinical qualification. Real clinical practice requires the appropriate qualifications, consent and supervision.",
  cta: {
    heading: "Understand what you carry. Learn a kinder, safer response.",
    body: "Start with a self-paced introduction that stays grounded and trauma-informed, then join live applied classes when you are ready to practise with fictional cases and faculty guidance.",
    primaryLabel: "Explore course options",
    secondaryLabel: "Talk to us on WhatsApp",
    secondaryHref:
      "https://wa.me/919137008686?text=Hi%2C%20I%20have%20a%20question%20about%20the%20Inner%20Child%20Healing%20and%20Therapy%20course.",
  },

  layout: "brief",
  hero: {
    eyebrow: "The Mind Point certificate course",
    title: "Inner Child Healing & Therapy",
    supporting:
      "Understand what we carry. Explore where it began. Learn healthier ways of responding today.",
    description:
      "Begin with a self-paced introduction that explains how childhood experience can shape adult patterns, what self-compassion actually involves, and why pace and safety matter. Then join live applied classes where you work through fictional cases and learn how a grounded, trauma-informed practitioner handles themes like grief, anger and forgiveness.",
    primaryCta: { label: "Explore course options", href: "#options" },
    secondaryCta: { label: "See what you will learn", href: "#outcomes" },
    scopeLine:
      "Educational training with fictional cases. This course is not personal therapy and does not confer an independent clinical qualification.",
  },

  overview: {
    eyebrow: "The course in one view",
    stages: [
      {
        label: "Stage 1 — Introductory self-paced course",
        title: "Recorded lessons with reading notes and reflection",
        body: "Recorded lessons with substantial reading notes and optional reflection questions. Learn what inner child work means, how early experience shapes adult life, what attachment patterns describe, and how to stay trauma-informed. Work at your own pace before you are asked to apply anything.",
      },
      {
        label: "Stage 2 — Applied live course",
        title: "Facilitated sessions built around cases and careful practice",
        body: "Facilitated sessions built around fictional cases, therapeutic stance, careful practice and review. Study how a practitioner holds grief, anger and forgiveness without forcing a timeline, and how context, consent and boundaries shape the work. Applied teaching happens live; this stage is not presented as a pre-recorded lecture package.",
      },
    ],
    progression:
      "First understand the patterns with care. Then practise responding to them without rushing the person or yourself.",
  },

  howItWorks: {
    title: "How the learning works",
    steps: [
      {
        title: "Read and watch at your pace.",
        body: "The introductory course builds a shared, trauma-informed vocabulary. The reading notes explain the meaning, purpose, examples and limits of each idea, and no personal disclosure is required.",
      },
      {
        title: "Try the reasoning with fictional cases.",
        body: "Learners practise recognising patterns in a fictional history, separating what is known from what is inferred, and choosing a response that fits the person's pace.",
      },
      {
        title: "Work through decisions live.",
        body: "In the applied classes, faculty demonstrate a stance, invite learners to practise it, introduce new information and debrief why a plan may need to change. Learning is evaluated through reasoning and responsible limits, not recall of exercises.",
      },
    ],
  },

  audienceGroups: [
    {
      title: "New to psychology?",
      body: "Begin with ordinary experience and clear definitions. You do not need a psychology degree to follow the introductory lessons, and you can pause and return to a concept before moving on.",
    },
    {
      title: "Studying psychology?",
      body: "Connect developmental ideas to specific cases. Practise distinguishing a pattern from a fixed trait, a description from a judgement, and support from therapy.",
    },
    {
      title: "Already in a helping profession?",
      body: "Revisit attachment, trauma-informed practice and pace. Use the applied sessions to test your reasoning and to identify questions for your own qualified supervision.",
    },
    {
      title: "Exploring a change of field?",
      body: "Get a serious, grounded introduction without being expected to heal anyone. Learn what these ideas can explain, and why professional training matters beyond a certificate.",
    },
  ],

  curriculum: {
    eyebrow: "Curriculum",
    title: "What you will cover",
    stages: [
      {
        key: "introductory",
        label: "Introductory self-paced",
        shortLabel: "Introductory",
        kind: "self-paced",
        blurb:
          "Recorded lessons with substantial reading notes and optional reflection questions. Learn the ideas and the cautions, at your own pace, before you apply anything.",
        formatNote:
          "Recorded lessons, a separate student reading manual, fictional examples, optional reflection prompts and worked reasoning.",
        items: [
          {
            title: "What we mean by the inner child",
            body: "Where the idea came from, what it is useful for, and what it is not — including the limits of metaphor.",
          },
          {
            title: "How childhood shapes adult life",
            body: "An introduction to how early relationships and experiences influence beliefs, expectations and responses.",
          },
          {
            title: "Attachment and relational patterns",
            body: "The idea of attachment styles, how patterns repeat, and why they are not a fixed verdict on a person.",
          },
          {
            title: "Self-compassion without self-indulgence",
            body: "What self-compassion actually involves, common misunderstandings, and simple practices that build it.",
          },
          {
            title: "Nurturing and validating",
            body: "Practical, gentle ways to offer care and comfort, and why rushing someone is counterproductive.",
          },
          {
            title: "Expressive and creative approaches",
            body: "An introduction to guided visualisation, writing and expressive arts, with clear caveats.",
          },
          {
            title: "Grief, anger, forgiveness and pace",
            body: "Why these themes deserve care, and why forgiveness is never something to force.",
          },
          {
            title: "Bringing the foundations together",
            body: "Reflect on a fictional case and prepare for the applied live stage, staying within your scope.",
          },
        ],
      },
      {
        key: "applied",
        label: "Applied live",
        shortLabel: "Applied live",
        kind: "live",
        blurb:
          "Facilitated sessions built around fictional cases, therapeutic stance and careful practice. Applied teaching happens live.",
        formatNote:
          "Live faculty-led teaching, demonstrations, discussion of fictional cases, structured practice, feedback and a separate applied student reading manual.",
        items: [
          {
            title: "Assessment, consent and a workable goal",
            body: "Learn what to ask before choosing a practice, and how to clarify a person's own goal, context and readiness.",
          },
          {
            title: "Holding a person's history with care",
            body: "Practise listening to a history without rushing to interpretation, and noticing what the person chooses not to share.",
          },
          {
            title: "Working with attachment and relational patterns",
            body: "Explore how patterns show up in the work, including in the helping relationship itself.",
          },
          {
            title: "Self-compassion as a practised skill",
            body: "Guide simple, safe self-compassion practices and recognise when a practice is landing badly.",
          },
          {
            title: "Expressive and creative work, done responsibly",
            body: "Discuss when visualisation or expressive methods help, when they do not, and how to offer a choice.",
          },
          {
            title: "Grief, anger and the question of forgiveness",
            body: "Work with strong feeling at the person's pace, and resist pressure to reach a tidy resolution.",
          },
          {
            title: "Trauma-informed boundaries and referral",
            body: "Recognise your scope, stay within it, and know when a situation needs a different level of care.",
          },
          {
            title: "Integration and outcome review",
            body: "Bring the work together, review what changed and what did not, and write a realistic plan for a difficult moment.",
          },
        ],
      },
    ],
  },

  materials: {
    eyebrow: "Included learning materials",
    title: "What is supplied for each stage",
    items: [
      {
        label: "Introductory student reading notes",
        note: "Supplied separately from the teaching script.",
      },
      {
        label: "Introductory recorded lessons",
        note: "Shown with their real release and access state once published in the LMS.",
      },
      {
        label: "Applied student reading notes",
        note: "Supplied separately from the live faculty guide.",
      },
      {
        label:
          "Fictional case examples, optional reflection prompts and model reasoning",
        note: "Within the course materials.",
      },
      {
        label: "Live applied teaching",
        note: "According to the actual cohort schedule and enrolment option.",
      },
    ],
    note: "The faculty recording script and live faculty guide are internal teaching documents, not downloadable student benefits.",
  },

  assessment: {
    eyebrow: "Assessment and completion",
    title: "How you are assessed",
    body: "The introductory stage includes knowledge checks and optional reflections on fictional cases so learners can confirm they understand the ideas and the cautions. Applied learning uses case discussion and practice of a grounded, trauma-informed stance.",
  },

  options: {
    eyebrow: "Course options",
    title: "Choose your route",
    items: [
      {
        key: "introductory",
        name: "Option A — Introductory self-paced course",
        bestFor:
          "First-time learners, people entering from another field and anyone who wants a careful, trauma-informed foundation or refresher.",
        includes: [
          "Recorded introductory lessons",
          "Introductory student notes",
          "Subject to the actual LMS release state",
        ],
        outcome:
          "Explain inner child work plainly, recognise early patterns in adult life, understand self-compassion and know why pace matters.",
        cta: { label: "Choose self-paced introduction", state: "enroll" },
        catalogueCode: "PRICHI",
        upgradeNote:
          "Upgrade to the live cohort later for the ₹2,000 difference.",
      },
      {
        key: "applied",
        name: "Option B — Applied live course",
        bestFor:
          "Learners who have completed the introduction or already know the core vocabulary and want guided practice.",
        includes: [
          "Live applied sessions",
          "Applied student notes",
          "Subject to the actual cohort schedule",
        ],
        outcome:
          "Practise holding a history with care, guiding safe practices and reviewing the work with faculty guidance.",
        cta: { label: "Explore live applied course", state: "enroll" },
        catalogueCode: "CCICH",
      },
    ],
  },

  closing: {
    heading: "Understand what you carry. Learn a kinder, safer response.",
    body: "The Mind Point brings a grounded introduction and live applied learning into one route. Start at your own pace, then join the live work when you are ready to practise with fictional cases and think carefully about pace, safety and scope.",
    ctaLabel: "Explore course options",
    ctaHref: "#options",
    scopeLine:
      "Educational certificate course. Real clinical practice requires the appropriate qualifications, consent and supervision.",
  },

  campaign: true,
  order: 2,
};
