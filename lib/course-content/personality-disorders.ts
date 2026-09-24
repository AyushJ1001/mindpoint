import type { CourseContent } from "@/lib/course-content/types";

/**
 * Personality Disorders — programme page content.
 *
 * Operational facts (price, dates, seats, faculty, checkout URLs) come from the
 * programme catalogue via `catalogueCode`; unconfigured fields are omitted
 * rather than guessed.
 */
export const personalityDisorders: CourseContent = {
  slug: "personality-disorders",
  title: "Personality Disorders",
  shortTitle: "Personality Disorders",
  category: "Certificate course",
  tagline:
    "Move beyond labels. Understand patterns, formulation and the person behind the diagnosis.",
  description:
    "A two-stage certificate course: a self-paced introduction, then live applied classes working through fictional cases without stigma.",
  heroCopy:
    "Move beyond labels. Understand patterns, formulation and the person behind the diagnosis.",
  learningOutcomes: [
    "Describe the recognised personality disorder categories and where they came from.",
    "Explain the difference between a lasting trait and a disorder, and why the distinction is debated.",
    "Recognise the clusters and their common presentations without caricature.",
    "Recognise stigma in language, in referral and in yourself, and choose a non-stigmatising alternative.",
    "Build a provisional formulation that starts from a person's history, context and strengths.",
    "Explain the purpose of the main therapeutic approaches to these difficulties, and their limits.",
    "Discuss risk, boundaries, supervision and when to refer on.",
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
        "No prior psychology study is required for the introductory self-paced stage. It begins with what a personality trait is and how the categories developed before using any diagnostic language.",
    },
    {
      question: "Will this course teach me to diagnose people?",
      answer:
        "No. You will study how the categories are defined and debated, and how practitioners build a formulation. This is educational training; it does not qualify you to diagnose or to provide psychotherapy.",
    },
    {
      question: "Is the course stigmatising?",
      answer:
        "The opposite is intended. Stigma, language and the harm that diagnostic labels can do are treated as central topics, not footnotes. The emphasis throughout is on the person, their history and their context.",
    },
    {
      question: "Is the applied stage recorded?",
      answer:
        "The applied stage is taught live. Replay access is only offered if the specific cohort includes recordings and The Mind Point has approved that benefit.",
    },
    {
      question: "How technical does the content get?",
      answer:
        "The introduction is written in plain language and defines each term before using it. The applied stage is more demanding and is built around formulation and case discussion.",
    },
    {
      question: "How do I know the price, dates and certificate requirements?",
      answer:
        "These are shown from the current enrolment option and cohort details on the page and at checkout. This course description is not a substitute for those live details.",
    },
  ],
  disclaimer:
    "Educational certificate course. Real clinical practice requires the appropriate qualifications, consent and supervision. This course does not confer an independent clinical qualification, and the certificate does not authorise psychotherapy practice.",
  cta: {
    heading: "Understand the patterns. Keep the person in view.",
    body: "Start with a self-paced introduction that treats stigma and formulation as essentials, then join live applied classes when you are ready to work through fictional cases with faculty guidance.",
    primaryLabel: "Explore course options",
    secondaryLabel: "Talk to us on WhatsApp",
    secondaryHref:
      "https://wa.me/919137008686?text=Hi%2C%20I%20have%20a%20question%20about%20the%20Personality%20Disorders%20course.",
  },

  layout: "brief",
  hero: {
    eyebrow: "The Mind Point certificate course",
    title: "Personality Disorders",
    supporting:
      "Move beyond labels. Understand patterns, formulation and the person behind the diagnosis.",
    description:
      "Begin with a self-paced introduction that explains how the categories developed, what the clusters describe and why these labels carry so much stigma. Then join live applied classes where you work through fictional cases, practise formulation and learn how a careful practitioner keeps the person, not the diagnosis, at the centre.",
    primaryCta: { label: "Explore course options", href: "#options" },
    secondaryCta: { label: "See what you will learn", href: "#outcomes" },
    scopeLine:
      "Educational training with fictional cases. This course does not confer an independent clinical qualification.",
  },

  overview: {
    eyebrow: "The course in one view",
    stages: [
      {
        label: "Stage 1 — Introductory self-paced course",
        title: "Recorded lessons with reading notes and reflection",
        body: "Recorded lessons with substantial reading notes and reflection questions. Learn what a personality trait is, how the DSM and ICD organise these patterns, what each cluster describes, and why diagnostic language can harm. Work at your own pace before you are asked to reason about a case.",
      },
      {
        label: "Stage 2 — Applied live course",
        title: "Facilitated sessions built around formulation and cases",
        body: "Facilitated sessions built around formulation, discussion of fictional cases, therapeutic stance and the limits of your role. Study how different approaches ask different questions about the same difficulty, and how context, consent, boundaries and risk affect a plan. Applied teaching happens live; this stage is not presented as a pre-recorded lecture package.",
      },
    ],
    progression:
      "First learn what the categories do and do not tell you. Then practise building an understanding that belongs to the person, not the label.",
  },

  howItWorks: {
    title: "How the learning works",
    steps: [
      {
        title: "Read and watch at your pace.",
        body: "The introductory course gives every learner a shared, non-stigmatising vocabulary before asking them to reason about complex presentations. The reading notes explain the meaning, purpose, examples and limits of each idea.",
      },
      {
        title: "Try the reasoning with fictional cases.",
        body: "Learners practise separating what is observed from what is inferred, noticing when a label is doing too much work, and asking what a formulation would need to explain.",
      },
      {
        title: "Work through decisions live.",
        body: "In the applied classes, faculty demonstrate a formulation process, invite learners to practise it, introduce new information and debrief why a plan may need to change. Learning is evaluated through reasoning and responsible limits, not recall of labels.",
      },
    ],
  },

  audienceGroups: [
    {
      title: "New to psychology?",
      body: "Begin with clear definitions and ordinary examples. You do not need a psychology degree to follow the introductory lessons, and you can pause and return to a concept before moving on.",
    },
    {
      title: "Studying psychology?",
      body: "Connect textbook categories to specific people and cases. Practise distinguishing a trait from a disorder, a description from a judgement, and a hypothesis from a fact.",
    },
    {
      title: "Already in a helping profession?",
      body: "Revisit formulation, stigma, risk and boundaries. Use the applied sessions to test your reasoning and to identify questions for your own qualified supervision.",
    },
    {
      title: "Exploring a change of field?",
      body: "Get a serious, ethical introduction without being expected to diagnose anyone. Learn what these categories can explain, and why professional training matters beyond a certificate.",
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
          "Recorded lessons with substantial reading notes and reflection questions. Learn how the categories developed, what the clusters describe, and why stigma and formulation matter from the start.",
        formatNote:
          "Recorded lessons, a separate student reading manual, fictional examples, reflection prompts and worked reasoning, studied at your own pace.",
        items: [
          {
            title: "What personality disorders are — and are not",
            body: "How the idea took shape, what a personality trait is, and when a lasting pattern is treated as a disorder.",
          },
          {
            title: "How the categories are organised",
            body: "The DSM and ICD approaches, the cluster idea, and the ongoing debate about categorical versus dimensional models.",
          },
          {
            title: "Cluster A: odd and eccentric",
            body: "An introduction to paranoid, schizoid and schizotypal presentations, described plainly and without caricature.",
          },
          {
            title: "Cluster B: dramatic and emotional",
            body: "Borderline, narcissistic, histrionic and antisocial presentations, and the stigma that surrounds these labels.",
          },
          {
            title: "Cluster C: anxious and fearful",
            body: "Avoidant, dependent and obsessive-compulsive presentations, and how anxiety shapes daily life.",
          },
          {
            title: "Stigma, language and the person in front of you",
            body: "Why diagnostic language can harm, how to talk about patterns respectfully, and what a label can and cannot tell you.",
          },
          {
            title: "From labels to formulation",
            body: "Why understanding a person requires their history, context and strengths, not only a category.",
          },
          {
            title: "Bringing the foundations together",
            body: "Use a fictional case to separate observation, inference and stigma, and prepare for the applied live stage.",
          },
        ],
      },
      {
        key: "applied",
        label: "Applied live",
        shortLabel: "Applied live",
        kind: "live",
        blurb:
          "Facilitated sessions built around formulation, case discussion, therapeutic stance and the limits of your role. Applied teaching happens live.",
        formatNote:
          "Live faculty-led teaching, demonstrations, discussion of fictional cases, structured practice, feedback and a separate applied student reading manual.",
        items: [
          {
            title: "Assessment, consent and a workable goal",
            body: "Learn what to ask before forming an opinion, and how to clarify a person's own goal, context and preferences.",
          },
          {
            title: "Building and revising a formulation",
            body: "Build a collaborative explanation grounded in history, context and strengths, and revise it when a new fact changes the story.",
          },
          {
            title: "Working with each cluster",
            body: "Practise the stance and questions that help across the clusters, without reducing a person to a textbook description.",
          },
          {
            title: "Emotion, self-harm and crisis",
            body: "Discuss how to think about distress and risk, and when a situation needs a different level of care.",
          },
          {
            title: "Evidence-informed approaches",
            body: "Compare the purpose and limits of the main therapeutic approaches, rather than treating any one as a complete answer.",
          },
          {
            title: "Stigma, power and the therapeutic relationship",
            body: "Examine how labels, power and expectation shape the work, and how to keep the relationship honest.",
          },
          {
            title: "Boundaries, supervision and referral",
            body: "Recognise when a boundary is needed, what to bring to supervision, and when to refer on.",
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
          "Fictional case examples, reflection questions and model reasoning",
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
    body: "The introductory stage includes knowledge checks and fictional case reflections so learners can confirm they understand the language and its limits. Applied learning uses case formulation, discussion and practice of a reasoned, non-stigmatising stance.",
  },

  options: {
    eyebrow: "Course options",
    title: "Choose your route",
    items: [
      {
        key: "introductory",
        name: "Option A — Introductory self-paced course",
        bestFor:
          "First-time learners, people entering from another field and anyone who wants a careful, non-stigmatising foundation or refresher.",
        includes: [
          "Recorded introductory lessons",
          "Introductory student notes",
          "Subject to the actual LMS release state",
        ],
        outcome:
          "Explain how the categories developed, describe the clusters plainly, recognise stigma and understand why formulation matters.",
        cta: { label: "Choose self-paced introduction", state: "enroll" },
        catalogueCode: "PRPDI",
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
          "Practise formulation, therapeutic stance, adaptation and review with faculty guidance.",
        cta: { label: "Explore live applied course", state: "enroll" },
        catalogueCode: "CCPD",
      },
    ],
  },

  closing: {
    heading: "Understand the patterns. Keep the person in view.",
    body: "The Mind Point brings a careful introduction and live applied learning into one route. Start at your own pace, then join the live work when you are ready to formulate, discuss and think carefully about the person behind the diagnosis.",
    ctaLabel: "Explore course options",
    ctaHref: "#options",
    scopeLine:
      "Educational certificate course. Real clinical practice requires the appropriate qualifications, consent and supervision.",
  },

  campaign: true,
  order: 3,
};
