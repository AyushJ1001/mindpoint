import type { CourseContent } from "@/lib/course-content/types";

/**
 * CBT, REBT and CBMT — programme page content.
 *
 * Operational facts (price, taxes, currency, cohort dates, seats, access
 * period, faculty names, certificate conditions, checkout URLs, payment
 * policy) are intentionally absent: they come from the programme
 * configuration. Unconfigured fields are omitted from the page, never filled
 * with a guess.
 */
export const cbtRebtCbmt: CourseContent = {
  slug: "cbt-rebt-cbmt",
  title: "CBT, REBT and CBMT",
  shortTitle: "CBT, REBT and CBMT",
  category: "Certificate course",
  tagline:
    "Understand the models. Practise the reasoning. Learn where each approach fits.",
  description:
    "A two-stage certificate course: a self-paced introduction, then live applied classes working through fictional cases.",
  heroCopy:
    "Understand the models. Practise the reasoning. Learn where each approach fits.",
  learningOutcomes: [
    "Describe a situation, thought or image, feeling, bodily response, action and consequence without treating them as interchangeable.",
    "Explain how a behaviour can bring relief immediately and still keep a difficulty going over time.",
    "Distinguish a CBT automatic thought, intermediate rule and possible core belief; test your inference against the person's context.",
    "Use REBT's ABCDE map to explore rigid demands while preserving the reality of loss, unfairness, family commitments and practical problems.",
    "Explain The Mind Point's CBMT strand through self-observation, action-based self-instruction, rehearsal and feedback; recognise the broad phases of stress inoculation training.",
    "Build and revise a provisional case formulation; choose questions and methods for a reason rather than from a label alone.",
    "Compare cognitive inquiry, behavioural experiments, behavioural activation, exposure and skills practice, including conditions that may make an exercise unsuitable.",
    "Review what changed, what did not, and what a setback plan should include.",
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
        "No prior psychology study is required for the introductory self-paced stage. The lessons begin with ordinary situations and define the technical terms before using them in cases.",
    },
    {
      question:
        "I already study or work in psychology. Should I start with the introduction?",
      answer:
        "The introduction is useful as a shared foundation and refresher. If you are comfortable with automatic thoughts, behavioural cycles, the REBT ABCDE map and self-instruction, the applied stage is designed to give you more demanding case reasoning. Follow any actual enrolment prerequisite displayed for the live cohort.",
    },
    {
      question: "Is the applied stage recorded?",
      answer:
        "The applied stage is taught live. Replay access is only offered if the specific cohort includes recordings and The Mind Point has approved that benefit.",
    },
    {
      question: "What is CBMT in this course?",
      answer:
        "The Mind Point uses CBMT for its cognitive behaviour modification therapy teaching strand. Here the focus is self-observation, action-based self-instruction, rehearsal, coping skills and feedback. Programmes elsewhere may use different labels or emphases.",
    },
    {
      question: "Will I learn to use the approaches with clients?",
      answer:
        "You will study models and practise reasoning through fictional cases. Professionals can relate the applied exercises to their existing training and supervision. This certificate alone does not qualify someone to diagnose, provide psychotherapy or work independently with clients.",
    },
    {
      question:
        "What if I am from another field and simply want to explore psychology?",
      answer:
        "You are welcome in the introductory stage. It is designed to build understanding without expecting clinical knowledge or personal disclosure. You can decide whether the applied live classes fit your goals after you have seen the foundations.",
    },
    {
      question:
        "Are the reading notes separate from the videos and live classes?",
      answer:
        "Yes. The student reading notes are substantive standalone materials for each stage. The introductory teaching script and applied faculty guide are separate internal teaching documents.",
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
    heading:
      "Build a foundation you can explain. Practise decisions you can revise.",
    body: "The Mind Point brings the foundational models and applied learning into one clear route. Start at your own pace, then join the live work when you are ready to analyse cases, test assumptions and think carefully about the person and the setting behind every technique.",
    primaryLabel: "Explore course options",
    secondaryLabel: "Talk to us on WhatsApp",
    secondaryHref:
      "https://wa.me/919137008686?text=Hi%2C%20I%20have%20a%20question%20about%20the%20CBT%2C%20REBT%20and%20CBMT%20course.",
  },

  layout: "brief",
  hero: {
    eyebrow: "The Mind Point certificate course",
    title: "CBT, REBT and CBMT",
    supporting:
      "Understand the models. Practise the reasoning. Learn where each approach fits.",
    description:
      "Start with a self-paced introduction that makes psychology understandable even if it is new to you. Then move into live applied classes where you can work through fictional cases, try structured exercises and learn how a thoughtful practitioner decides what to ask before choosing a technique. The two stages are designed to connect, while giving experienced learners enough depth to examine familiar ideas more carefully.",
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
        title: "Eight recorded lessons with reading notes and reflection",
        body: "Eight recorded lessons with substantial reading notes and reflection questions. Learn the vocabulary, history and central ideas of cognitive behavioural therapy, rational emotive behaviour therapy and The Mind Point's cognitive behaviour modification teaching strand (CBMT). Work through examples at your own pace before you are expected to apply a model.",
      },
      {
        label: "Stage 2 — Applied live course",
        title: "Eight facilitated sessions built around cases and practice",
        body: "Eight facilitated sessions built around case formulation, technique choice, role play, feedback and revision. Study how CBT, REBT and CBMT can ask different questions about one situation, and how context, consent, professional boundaries and new information affect a plan. Applied teaching happens live; this stage is not presented as a pre-recorded lecture package.",
      },
    ],
    progression:
      "First learn to name what you are seeing. Then practise deciding what to do with what you know—and what you still need to find out.",
  },

  howItWorks: {
    title: "How the learning works",
    steps: [
      {
        title: "Read and watch at your pace.",
        body: "The introductory course gives every learner a shared vocabulary before asking them to make complex decisions. The reading notes go beyond a quick slide deck: they explain the meaning, purpose, examples, practical uses and limits of each topic.",
      },
      {
        title: "Try the reasoning with fictional cases.",
        body: "An unanswered email, presentation feedback, family expectations or a difficult workplace conversation can produce more than one plausible explanation. Learners practise asking what information is missing and what new fact would change an initial view.",
      },
      {
        title: "Work through decisions live.",
        body: "In the applied classes, faculty demonstrate a thought process, invite learners to practise it, introduce new details and debrief why a plan may need to change. Learning is evaluated through reasoning and responsible limits, not only recall of technique names.",
      },
    ],
  },

  audienceGroups: [
    {
      title: "New to psychology?",
      body: "Begin with ordinary situations, clear definitions and step-by-step examples. You do not need a psychology degree to understand the introductory lessons. You can pause, reread and return to a concept before moving on.",
    },
    {
      title: "Studying psychology?",
      body: "Connect terms from textbooks to specific cases. Practise separating an observed event from an interpretation, a hypothesis from a fact, and a technique from the reason for choosing it.",
    },
    {
      title: "Already in a helping profession?",
      body: "Revisit the foundations through formulation, collaborative inquiry, ethical adaptation and outcome review. Use the applied sessions to test your reasoning and identify questions for your own qualified supervision.",
    },
    {
      title: "Exploring a change of field?",
      body: "Get a serious introduction without being expected to diagnose anyone or conduct therapy. Learn how psychological models are used, what they can explain and why professional training matters beyond a certificate course.",
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
          "Eight recorded lessons with substantial reading notes and reflection questions. Learn the vocabulary, history and central ideas, and work through examples at your own pace before you are expected to apply a model.",
        formatNote:
          "Recorded lessons, a separate student reading manual, fictional examples, reflection prompts and worked reasoning. Learners can move through the foundational teaching at their own pace.",
        items: [
          {
            title: "A shared language for studying psychology",
            body: "Begin with an everyday situation and separate what happened from what someone predicted, felt and did. Learn how to distinguish observation, report and hypothesis. This gives beginners a way into the course and gives experienced learners a useful check against premature conclusions.",
          },
          {
            title: "Where CBT, REBT and CBMT came from",
            body: "Trace the questions that shaped behavioural learning, Beck's cognitive model, Ellis's REBT and Meichenbaum's cognitive behaviour modification work. Compare the approaches by what each helps us notice, rather than treating their names as interchangeable.",
          },
          {
            title: "Understanding the cognitive behavioural cycle",
            body: "Map a situation, meaning, emotion and body response, action, immediate consequence and later consequence. See how an avoidance cycle may form, and how an unfair or unsafe environment changes the interpretation of the same diagram.",
          },
          {
            title: "Automatic thoughts and deeper beliefs",
            body: "Recognise fast thoughts or images, conditional assumptions and broader belief themes. Explore familiar thinking-pattern labels with care: they are prompts for inquiry, not judgments about a person or proof that a genuine concern is false.",
          },
          {
            title: "Emotion, behaviour and learning",
            body: "Understand why feelings deserve attention and how consequences shape action. Introduce negative reinforcement, behavioural activation, exposure and skills learning in plain language, with clear distinctions among them.",
          },
          {
            title: "REBT beliefs and the ABCDE map",
            body: "Work from an activating event through belief and consequence, then explore disputation and a more flexible effective perspective. Examine demands, awfulising, frustration tolerance and global self-ratings without asking someone to deny a real loss.",
          },
          {
            title: "Cognitive behaviour modification and coping dialogue",
            body: "Learn how self-observation, a brief task-specific self-instruction, rehearsal and feedback can support a chosen action. Meet the broad phases of stress inoculation training without treating the method as a promise of immunity to stress.",
          },
          {
            title: "Bringing the foundations together",
            body: "Apply the three lenses to one fictional workplace situation. Separate what is known from what is inferred, ask about the environment, and prepare for the more demanding decisions in the live applied stage.",
          },
        ],
      },
      {
        key: "applied",
        label: "Applied live",
        shortLabel: "Applied live",
        kind: "live",
        blurb:
          "Eight facilitated sessions built around case formulation, technique choice, role play, feedback and revision. Applied teaching happens live and is not presented as a pre-recorded lecture package.",
        formatNote:
          "Live faculty-led teaching, demonstrations, discussion of fictional cases, structured role play, feedback and a separate applied student reading manual. The faculty guide supports live teaching and is not a student recording script.",
        items: [
          {
            title: "Assessment, consent and a workable goal",
            body: "Learn what to ask before choosing a worksheet or method. Practise clarifying a person's own goal, a recent example, urgent practical concerns, strengths, preferences and whether a proposed exercise is feasible and welcome.",
          },
          {
            title: "Building and revising a CBT formulation",
            body: "Build a collaborative explanation of a specific episode and the loop that may maintain it. Add context and strengths, invite the person's correction, and revise the map when a new fact changes the story.",
          },
          {
            title: "Cognitive inquiry and behavioural experiments",
            body: "Practise questions that genuinely seek evidence rather than lead someone to a predetermined answer. Design a modest testable prediction, agree on an observation, and interpret both confirming and unexpected results.",
          },
          {
            title: "Behavioural activation, exposure and skills practice",
            body: "Compare three methods that serve different purposes: rebuilding access to valued activity, learning around a safe feared cue, and rehearsing a missing action. Explain why a real barrier or unsafe setting changes the plan.",
          },
          {
            title: "REBT disputation and emotional change",
            body: "Explore logical, evidence-based and practical questions about rigid demands. Role-play a respectful conversation that protects the person's values and cultural context while questioning a global verdict about worth.",
          },
          {
            title: "CBMT self-instruction and stress inoculation training",
            body: "Observe an unhelpful action sequence, build a short instruction linked to an observable task, rehearse it and review feedback. Study the broad phases of understanding stress, acquiring coping skills and applying them in realistic situations.",
          },
          {
            title: "Session structure, adaptation and professional boundaries",
            body: "Run a structured but responsive session. Adapt an exercise to language, privacy, access, time and power differences. Recognise when the environment or a professional procedure needs attention before a cognitive exercise.",
          },
          {
            title: "Integration, outcome review and setback planning",
            body: "Bring the approaches together without stacking techniques mechanically. Review progress and unwanted costs, revise a plan when evidence is mixed, and write a realistic response for a future difficult moment.",
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
          "Fictional case examples, reflection questions, practice tasks and model reasoning",
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
    body: "The introductory stage includes knowledge checks and fictional case reflections so learners can confirm they understand the language of the models. Applied learning uses case analysis, discussion and practice of a reasoned decision.",
  },

  options: {
    eyebrow: "Course options",
    title: "Choose your route",
    items: [
      {
        key: "introductory",
        name: "Option A — Introductory self-paced course",
        bestFor:
          "First-time learners, people entering from another field and anyone who wants a careful foundation or refresher.",
        includes: [
          "Eight introductory lessons",
          "Introductory student notes",
          "Subject to the actual LMS release state",
        ],
        outcome:
          "Explain core concepts, distinguish the three approaches and analyse a fictional case without jumping to diagnosis or a technique.",
        cta: { label: "Choose self-paced introduction", state: "enroll" },
        catalogueCode: "PRCBTI",
        upgradeNote:
          "Upgrade to the live cohort later for the ₹2,000 difference.",
      },
      {
        key: "applied",
        name: "Option B — Applied live course",
        bestFor:
          "Learners who have completed the introduction or already know the core vocabulary and want guided practice.",
        includes: [
          "Eight live applied sessions",
          "Applied student notes",
          "Subject to the actual cohort schedule",
        ],
        outcome:
          "Practise formulation, method selection, role play, adaptation and review with faculty guidance.",
        cta: { label: "Explore live applied course", state: "enroll" },
        catalogueCode: "CCCBT",
      },
    ],
  },

  upgrade: {
    eyebrow: "Already started self-paced?",
    title: "Move into the live cohort without paying twice",
    body: "If you have bought the self-paced introduction, you can join the live applied course at any time. Your self-paced fee is credited, so you pay only the difference.",
    ctaLabel: "Upgrade to the live cohort",
    fromKey: "introductory",
    toKey: "applied",
  },

  closing: {
    heading:
      "Build a foundation you can explain. Practise decisions you can revise.",
    body: "The Mind Point brings the foundational models and applied learning into one clear route. Start at your own pace, then join the live work when you are ready to analyse cases, test assumptions and think carefully about the person and the setting behind every technique.",
    ctaLabel: "Explore course options",
    ctaHref: "#options",
    scopeLine:
      "Educational certificate course. Real clinical practice requires the appropriate qualifications, consent and supervision.",
  },

  campaign: false,
  order: 1,
};
