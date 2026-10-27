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
    "An eight-week live certificate course: six weeks of structured learning, then two weeks of practical training working gently and responsibly with childhood patterns.",
  heroCopy:
    "Understand what we carry. Explore where it began. Learn healthier ways of responding today.",
  whyItMatters:
    "What we carry from childhood shapes how we respond today, often without our noticing. Understanding those patterns — and learning how to work with them gently and at a safe pace — matters for anyone who wants to respond rather than react.",
  image: {
    src: "/coastal/calm.jpg",
    alt: "Sunrise over a calm sea, with gentle surf reaching wet sand.",
  },
  lifetimeRecordings: true,
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
    subtitle: "Weeks 1–6 · Structured learning",
    formats: [],
    modules: [],
    assessment: undefined,
  },
  partTwo: {
    title: "Part II — Applied",
    subtitle: "Weeks 7–8 · Practical training",
    formats: [],
    sessions: [],
    assessment: undefined,
  },
  caseRoom: [],
  toolkit: [],
  faculty: [],
  duration: "8 weeks",
  weeklyCommitment: undefined,
  selfPacedStart: undefined,
  liveStart: undefined,
  liveEnd: undefined,
  cohortSize: undefined,
  certificateFoundation: undefined,
  certificateComplete: undefined,
  pricing: {
    foundation: {
      name: "Structured learning",
      description: "Live classes, weeks 1–6.",
      includes: [],
    },
    complete: {
      name: "Practical training",
      description: "Guided practice, weeks 7–8.",
      includes: [],
      primary: true,
    },
  },
  faq: [
    {
      question: "Do I need a psychology background?",
      answer:
        "No prior psychology study is required. The first weeks begin with ordinary experience and define each idea before using it.",
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
      question: "Are the live classes recorded?",
      answer:
        "Classes are taught live, and enrolments from 27 October 2026 keep access to the recordings for as long as The Mind Point's platform operates. If the platform ever closes, we give 90 days' notice with a download window. Earlier enrolments keep the access that applied when they joined.",
    },
    {
      question: "Does this make me a therapist?",
      answer:
        "No. It builds understanding and skill, but it is not a degree or a licence, and it does not qualify you to practise independently where local law requires registration.",
    },
    {
      question: "I bought a self-paced intro course. Can I upgrade?",
      answer:
        "Yes. The fee you paid for a self-paced intro course is credited once against any certificate course, not only the one on the same topic. Sign in before checkout and the credit is applied for you.",
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
    body: "Eight weeks of live learning: six weeks on how childhood experience shapes adult patterns, then two weeks practising a grounded, trauma-informed response with fictional cases and faculty guidance.",
    primaryLabel: "See dates and fees",
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
      "Over eight weeks of live classes, learn how childhood experience can shape adult patterns, what self-compassion involves, and why pace and safety matter. The first six weeks build that understanding. The final two weeks are practical training: fictional cases where you practise how a grounded, trauma-informed practitioner handles grief, anger and forgiveness.",
    primaryCta: { label: "See dates and fees", href: "#options" },
    secondaryCta: { label: "See what you will learn", href: "#outcomes" },
    scopeLine:
      "Educational training with fictional cases. This course is not personal therapy and does not confer an independent clinical qualification.",
  },

  overview: {
    eyebrow: "The course in one view",
    title: "Six Weeks to Build Your Understanding. Two Weeks to Bring It to Life.",
    supporting:
      "Six weeks of live classes build your understanding of early patterns, attachment and self-compassion. Two weeks of practical training put that understanding to work on fictional cases, with faculty feedback.",
    eightWeekJourney: true,
    stages: [
      {
        label: "Weeks 1–6 — Structured learning",
        title: "Live classes on patterns, attachment and self-compassion",
        body: "Learn what inner child work means, how early experience shapes adult life, what attachment patterns describe and how to stay trauma-informed. Then move into assessment, holding a history with care and working with relational patterns, with reading notes and optional reflection alongside each class.",
      },
      {
        label: "Weeks 7–8 — Practical training",
        title: "Careful practice with fictional cases",
        body: "Two weeks of practical training built around expressive work, grief and anger, trauma-informed boundaries and review. Work through fictional cases with faculty feedback, and see how context, consent and scope shape the work. No personal disclosure is required.",
      },
    ],
    progression:
      "First understand the patterns with care. Then practise responding to them without rushing the person or yourself.",
  },

  howItWorks: {
    title: "How the learning works",
    steps: [
      {
        title: "Learn live, then consolidate with the notes.",
        body: "The early weeks build a shared, trauma-informed vocabulary. The reading notes explain the meaning, purpose, examples and limits of each idea, and no personal disclosure is required.",
      },
      {
        title: "Try the reasoning with fictional cases.",
        body: "Learners practise recognising patterns in a fictional history, separating what is known from what is inferred, and choosing a response that fits the person's pace.",
      },
      {
        title: "Practise decisions in the final two weeks.",
        body: "In the practical weeks, faculty demonstrate a stance, invite learners to practise it, introduce new information and debrief why a plan may need to change. Learning is evaluated through reasoning and responsible limits, not recall of exercises.",
      },
    ],
  },

  audienceGroups: [
    {
      title: "New to psychology?",
      body: "Begin with ordinary experience and clear definitions. You do not need a psychology degree to follow the early weeks, and the reading notes let you return to a concept before moving on.",
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
    title: "What you will cover, week by week",
    stages: [
      {
        key: "learning",
        label: "Weeks 1–6 · Structured learning",
        shortLabel: "Weeks 1–6",
        kind: "live",
        blurb:
          "Six weeks of live classes. Learn the ideas and the cautions, then move into assessment, holding a history with care and working with relational patterns.",
        formatNote:
          "Live faculty-led classes, student reading notes, fictional examples, reflection prompts and worked reasoning.",
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
            body: "Reflect on a fictional case and prepare for the formulation and case work that follows, staying within your scope.",
          },
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
        ],
      },
      {
        key: "practical",
        label: "Weeks 7–8 · Practical training",
        shortLabel: "Weeks 7–8",
        kind: "practical",
        blurb:
          "Two weeks of practical training. Practise expressive work, grief and anger, trauma-informed boundaries and review, working on fictional cases with faculty feedback.",
        formatNote:
          "Faculty-guided practice with fictional cases, structured exercises, feedback and review.",
        items: [
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
    title: "What is included",
    items: [
      {
        label: "Live classes across all eight weeks",
        note: "According to the published cohort schedule.",
      },
      {
        label: "Student reading notes",
        note: "Supplied separately from the faculty teaching guide.",
      },
      {
        label:
          "Fictional case examples, optional reflection prompts and model reasoning",
        note: "Within the course materials.",
      },
      {
        label: "Practical training in weeks 7 and 8",
        note: "Guided exercises with faculty feedback.",
      },
    ],
    note: "The faculty teaching guide is an internal document, not a downloadable student benefit.",
  },

  assessment: {
    eyebrow: "Assessment and completion",
    title: "How you are assessed",
    body: "The learning weeks include knowledge checks and optional reflections on fictional cases so learners can confirm they understand the ideas and the cautions. The practical weeks use case discussion and practice of a grounded, trauma-informed stance, reviewed with faculty.",
  },

  certificate: {
    eyebrow: "Certificate",
    title: "A certificate you earn, not collect.",
    body: "On successful completion you receive a certificate of completion that states the course title and that it is an educational certificate. The wording is honest: it is not a degree, a licence or a clinical qualification, and it does not authorise psychotherapy practice.",
    items: [
      "Awarded on assessed completion.",
      "States the course title and its educational nature.",
      "Does not claim to be a degree, licence or clinical qualification.",
    ],
  },

  options: {
    eyebrow: "Enrol",
    title: "January 2027 live cohort",
    items: [
      {
        key: "applied",
        name: "Eight-week live certificate course",
        bestFor:
          "Students, graduates and practitioners who want a careful, trauma-informed understanding of childhood patterns and guided practice responding to them.",
        includes: [
          "Six weeks of structured live learning",
          "Two weeks of guided practical training",
          "Student reading notes",
        ],
        outcome:
          "Explain inner child work plainly, recognise early patterns in adult life, and practise holding a history with care and guiding safe practices with faculty feedback.",
        cta: { label: "Enrol in the January cohort", state: "enroll" },
        catalogueCode: "CCICH",
      },
    ],
  },

  closing: {
    heading: "Understand what you carry. Learn a kinder, safer response.",
    body: "Six weeks to understand the patterns with care. Two weeks to practise responding to them at a safe pace, within your scope, with faculty feedback.",
    ctaLabel: "See dates and fees",
    ctaHref: "#options",
    scopeLine:
      "Educational certificate course. Real clinical practice requires the appropriate qualifications, consent and supervision.",
  },

  campaign: true,
  order: 2,
};
