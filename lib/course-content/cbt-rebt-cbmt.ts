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
    "An eight-week live certificate course: six weeks of structured learning, then two weeks of practical training with fictional cases.",
  heroCopy:
    "Understand the models. Practise the reasoning. Learn where each approach fits.",
  whyItMatters:
    "Three approaches — CBT, REBT and CBMT — each describe how thoughts, feelings and actions shape one another. Taught in isolation, each leaves gaps. Joined together, they give you a clearer way to read a situation, name what you are seeing, and decide what to do next — for a reason rather than from a label alone.",
  image: {
    src: "/coastal/shore.jpg",
    alt: "A quiet shoreline at sunrise, seen from the water's edge.",
  },
  lifetimeRecordings: true,
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
        "No prior psychology study is required. The first weeks begin with ordinary situations and define the technical terms before using them in cases.",
    },
    {
      question:
        "I already study or work in psychology. Will this be too basic?",
      answer:
        "The first weeks set out a shared vocabulary, which doubles as a refresher. The course then moves into formulation, technique choice and two weeks of practical training that ask for careful reasoning rather than recall of terms.",
    },
    {
      question: "Are the live classes recorded?",
      answer:
        "Classes are taught live. Replay access is only offered if the specific cohort includes recordings and The Mind Point has approved that benefit.",
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
        "You are welcome. The course builds understanding without expecting clinical knowledge or personal disclosure, and the early weeks define every term before using it.",
    },
    {
      question: "Are there reading notes as well as the live classes?",
      answer:
        "Yes. Student reading notes accompany the classes as substantive standalone material. The faculty teaching guide is a separate internal document.",
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
    heading:
      "Build a foundation you can explain. Practise decisions you can revise.",
    body: "Eight weeks of live learning: six weeks building the models and the reasoning behind them, then two weeks practising case formulation, technique choice and review with faculty guidance.",
    primaryLabel: "See dates and fees",
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
      "Over eight weeks of live classes, learn the vocabulary, history and central ideas of CBT, REBT and The Mind Point's CBMT strand, then use them on fictional cases. The first six weeks build the models and the reasoning behind them. The final two weeks are practical training: formulation, technique choice, role play and review with faculty feedback.",
    primaryCta: { label: "See dates and fees", href: "#options" },
    secondaryCta: { label: "See what you will learn", href: "#outcomes" },
    scopeLine:
      "Educational training with fictional cases. This course does not confer an independent clinical qualification.",
  },

  overview: {
    eyebrow: "The course in one view",
    title: "Six Weeks to Build Your Understanding. Two Weeks to Bring It to Life.",
    supporting:
      "Six weeks of live classes build the models and the reasoning behind them. Two weeks of practical training put that reasoning to work on fictional cases, with faculty feedback.",
    eightWeekJourney: true,
    stages: [
      {
        label: "Weeks 1–6 — Structured learning",
        title:
          "Live classes that build the models and the reasoning behind them",
        body: "Learn the vocabulary, history and central ideas of cognitive behavioural therapy, rational emotive behaviour therapy and The Mind Point's cognitive behaviour modification teaching strand (CBMT). Then move into assessment, formulation, cognitive inquiry and behavioural methods, with reading notes and fictional examples alongside each class.",
      },
      {
        label: "Weeks 7–8 — Practical training",
        title: "Guided practice with fictional cases",
        body: "Two weeks of practical training built around REBT disputation, CBMT self-instruction, session structure and outcome review. Work through fictional cases with role play and faculty feedback, and see how context, consent and professional boundaries change a plan.",
      },
    ],
    progression:
      "First learn to name what you are seeing. Then practise deciding what to do with what you know—and what you still need to find out.",
  },

  howItWorks: {
    title: "How the learning works",
    steps: [
      {
        title: "Learn live, then consolidate with the notes.",
        body: "The early weeks give every learner a shared vocabulary before asking them to make complex decisions. The reading notes go beyond a quick slide deck: they explain the meaning, purpose, examples, practical uses and limits of each topic.",
      },
      {
        title: "Try the reasoning with fictional cases.",
        body: "An unanswered email, presentation feedback, family expectations or a difficult workplace conversation can produce more than one plausible explanation. Learners practise asking what information is missing and what new fact would change an initial view.",
      },
      {
        title: "Practise decisions in the final two weeks.",
        body: "In the practical weeks, faculty demonstrate a thought process, invite learners to practise it, introduce new details and debrief why a plan may need to change. Learning is evaluated through reasoning and responsible limits, not only recall of technique names.",
      },
    ],
  },

  audienceGroups: [
    {
      title: "New to psychology?",
      body: "Begin with ordinary situations, clear definitions and step-by-step examples. You do not need a psychology degree to follow the early weeks, and the reading notes let you return to a concept before moving on.",
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
    title: "What you will cover, week by week",
    stages: [
      {
        key: "learning",
        label: "Weeks 1–6 · Structured learning",
        shortLabel: "Weeks 1–6",
        kind: "live",
        blurb:
          "Six weeks of live classes. Learn the vocabulary, history and central ideas, then move into assessment, formulation, cognitive inquiry and behavioural methods.",
        formatNote:
          "Live faculty-led classes, student reading notes, fictional examples, reflection prompts and worked reasoning.",
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
            body: "Apply the three lenses to one fictional workplace situation. Separate what is known from what is inferred, ask about the environment, and prepare for the formulation and method choices that follow.",
          },
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
        ],
      },
      {
        key: "practical",
        label: "Weeks 7–8 · Practical training",
        shortLabel: "Weeks 7–8",
        kind: "practical",
        blurb:
          "Two weeks of practical training. Apply REBT disputation and CBMT self-instruction, run a structured session and review outcomes, working on fictional cases with faculty feedback.",
        formatNote:
          "Faculty-guided practice with fictional cases, structured exercises, feedback and review.",
        items: [
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
          "Fictional case examples, reflection questions, practice tasks and model reasoning",
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
    body: "The learning weeks include knowledge checks and fictional case reflections so learners can confirm they understand the language of the models. The practical weeks use case analysis, role play and a reasoned decision reviewed with faculty.",
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
          "Students, graduates and practitioners who want a careful foundation in CBT, REBT and CBMT and guided practice applying it.",
        includes: [
          "Six weeks of structured live learning",
          "Two weeks of guided practical training",
          "Student reading notes",
        ],
        outcome:
          "Explain the three approaches, build and revise a formulation, and practise method selection, role play, adaptation and review with faculty guidance.",
        cta: { label: "Enrol in the January cohort", state: "enroll" },
        catalogueCode: "CCCBT",
      },
    ],
  },

  closing: {
    heading:
      "Build a foundation you can explain. Practise decisions you can revise.",
    body: "Six weeks to understand the models and how they differ. Two weeks to practise using them carefully on fictional cases, with faculty feedback on your reasoning.",
    ctaLabel: "See dates and fees",
    ctaHref: "#options",
    scopeLine:
      "Educational certificate course. Real clinical practice requires the appropriate qualifications, consent and supervision.",
  },

  campaign: true,
  order: 1,
};
