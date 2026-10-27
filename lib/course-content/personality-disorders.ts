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
    "An eight-week live certificate course: six weeks of structured learning, then two weeks of practical training working through fictional cases without stigma.",
  heroCopy:
    "Move beyond labels. Understand patterns, formulation and the person behind the diagnosis.",
  whyItMatters:
    "Personality disorder labels are widely used and widely misunderstood. Learning how the categories developed, what they describe, and why they carry so much stigma matters because the person is always more than the diagnosis. This course keeps the person — not the label — at the centre.",
  image: {
    src: "/coastal/hero.jpg",
    alt: "Turquoise water meeting pale sand, seen from above.",
  },
  lifetimeRecordings: true,
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
        "No prior psychology study is required. The first weeks begin with what a personality trait is and how the categories developed before using any diagnostic language.",
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
      question: "Are the live classes recorded?",
      answer:
        "Classes are taught live. Replay access is only offered if the specific cohort includes recordings and The Mind Point has approved that benefit.",
    },
    {
      question: "How technical does the content get?",
      answer:
        "The early weeks are in plain language and define each term before using it. The later weeks are more demanding and are built around formulation and case discussion.",
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
    "Educational certificate course. Real clinical practice requires the appropriate qualifications, consent and supervision. This course does not confer an independent clinical qualification, and the certificate does not authorise psychotherapy practice.",
  cta: {
    heading: "Understand the patterns. Keep the person in view.",
    body: "Eight weeks of live learning: six weeks on the categories, stigma and formulation, then two weeks working through fictional cases with faculty guidance.",
    primaryLabel: "See dates and fees",
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
      "Over eight weeks of live classes, learn how the categories developed, what the clusters describe and why these labels carry so much stigma. The first six weeks build that understanding and the basics of formulation. The final two weeks are practical training: fictional cases where you practise keeping the person, not the diagnosis, at the centre.",
    primaryCta: { label: "See dates and fees", href: "#options" },
    secondaryCta: { label: "See what you will learn", href: "#outcomes" },
    scopeLine:
      "Educational training with fictional cases. This course does not confer an independent clinical qualification.",
  },

  overview: {
    eyebrow: "The course in one view",
    title: "Six Weeks to Build Your Understanding. Two Weeks to Bring It to Life.",
    supporting:
      "Six weeks of live classes build your understanding of the categories, stigma and formulation. Two weeks of practical training put that understanding to work on fictional cases, with faculty feedback.",
    eightWeekJourney: true,
    stages: [
      {
        label: "Weeks 1–6 — Structured learning",
        title: "Live classes on the categories, stigma and formulation",
        body: "Learn what a personality trait is, how the DSM and ICD organise these patterns, what each cluster describes and why diagnostic language can harm. Then move into assessment, formulation, the main therapeutic approaches and working across the clusters, with reading notes alongside each class.",
      },
      {
        label: "Weeks 7–8 — Practical training",
        title: "Formulation and case practice",
        body: "Two weeks of practical training built around distress and risk, stigma and power, boundaries and supervision, and review. Work through fictional cases with faculty feedback, and see how context, consent and the limits of your role affect a plan.",
      },
    ],
    progression:
      "First learn what the categories do and do not tell you. Then practise building an understanding that belongs to the person, not the label.",
  },

  howItWorks: {
    title: "How the learning works",
    steps: [
      {
        title: "Learn live, then consolidate with the notes.",
        body: "The early weeks give every learner a shared, non-stigmatising vocabulary before asking them to reason about complex presentations. The reading notes explain the meaning, purpose, examples and limits of each idea.",
      },
      {
        title: "Try the reasoning with fictional cases.",
        body: "Learners practise separating what is observed from what is inferred, noticing when a label is doing too much work, and asking what a formulation would need to explain.",
      },
      {
        title: "Practise decisions in the final two weeks.",
        body: "In the practical weeks, faculty demonstrate a formulation process, invite learners to practise it, introduce new information and debrief why a plan may need to change. Learning is evaluated through reasoning and responsible limits, not recall of labels.",
      },
    ],
  },

  audienceGroups: [
    {
      title: "New to psychology?",
      body: "Begin with clear definitions and ordinary examples. You do not need a psychology degree to follow the early weeks, and the reading notes let you return to a concept before moving on.",
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
    title: "What you will cover, week by week",
    stages: [
      {
        key: "learning",
        label: "Weeks 1–6 · Structured learning",
        shortLabel: "Weeks 1–6",
        kind: "live",
        blurb:
          "Six weeks of live classes. Learn how the categories developed, what the clusters describe and why stigma matters, then move into assessment, formulation and the main therapeutic approaches.",
        formatNote:
          "Live faculty-led classes, student reading notes, fictional examples, reflection prompts and worked reasoning.",
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
            body: "Use a fictional case to separate observation, inference and stigma, and prepare for the formulation and case work that follows.",
          },
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
            title: "Evidence-informed approaches",
            body: "Compare the purpose and limits of the main therapeutic approaches, rather than treating any one as a complete answer.",
          },
        ],
      },
      {
        key: "practical",
        label: "Weeks 7–8 · Practical training",
        shortLabel: "Weeks 7–8",
        kind: "practical",
        blurb:
          "Two weeks of practical training. Work on distress and risk, stigma and power, boundaries and supervision, and review, using fictional cases with faculty feedback.",
        formatNote:
          "Faculty-guided practice with fictional cases, structured exercises, feedback and review.",
        items: [
          {
            title: "Emotion, self-harm and crisis",
            body: "Discuss how to think about distress and risk, and when a situation needs a different level of care.",
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
          "Fictional case examples, reflection questions and model reasoning",
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
    body: "The learning weeks include knowledge checks and fictional case reflections so learners can confirm they understand the language and its limits. The practical weeks use case formulation, discussion and practice of a reasoned, non-stigmatising stance, reviewed with faculty.",
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
          "Students, graduates and practitioners who want a careful, non-stigmatising understanding of personality disorders and guided practice in formulation.",
        includes: [
          "Six weeks of structured live learning",
          "Two weeks of guided practical training",
          "Student reading notes",
        ],
        outcome:
          "Describe the clusters plainly, recognise stigma, and practise formulation, therapeutic stance and review with faculty guidance.",
        cta: { label: "Enrol in the January cohort", state: "enroll" },
        catalogueCode: "CCPD",
      },
    ],
  },

  closing: {
    heading: "Understand the patterns. Keep the person in view.",
    body: "Six weeks to learn what the categories do and do not tell you. Two weeks to practise building an understanding that belongs to the person, with faculty feedback.",
    ctaLabel: "See dates and fees",
    ctaHref: "#options",
    scopeLine:
      "Educational certificate course. Real clinical practice requires the appropriate qualifications, consent and supervision.",
  },

  campaign: true,
  order: 3,
};
