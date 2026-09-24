import type { CourseContent } from "@/lib/course-content/types";

/**
 * Counselling Psychology Internship — programme page content.
 *
 * Two routes: a self-paced primer (the existing "Clinical Vs Counselling
 * Psychology" pre-recorded course, code PRCVCP) and the supervised internship
 * cohort (code INCLP). Operational facts come from the catalogue via
 * `catalogueCode`.
 */
export const counsellingInternship: CourseContent = {
  slug: "counselling-internship",
  title: "Counselling Psychology Internship",
  shortTitle: "Counselling Internship",
  category: "Applied internship",
  tagline:
    "Move from learning counselling to practising counselling skills, with supervision.",
  description:
    "A supervised, cohort-based counselling internship, with a self-paced primer for those who want to understand the field first.",
  heroCopy:
    "Start with a self-paced primer on the difference between clinical and counselling psychology, then join a supervised cohort to practise counselling skills.",
  learningOutcomes: [
    "Explain the difference between clinical and counselling psychology, and where counselling fits.",
    "Describe what counselling can and cannot help with, and why scope and referral matter.",
    "Practise core counselling skills: listening, reflecting, questioning and structuring a session.",
    "Take a history and build a shared understanding of a person's difficulty.",
    "Recognise risk, boundaries and ethical concerns, and know when to refer on.",
    "Use supervision well: present work, receive feedback and revise your approach.",
    "Review your own development honestly, including what you still need to learn.",
  ],
  audience: [],
  prerequisites: [],
  partOne: {
    title: "Part I — Primer",
    subtitle: "Self-paced primer",
    formats: [],
    modules: [],
    assessment: undefined,
  },
  partTwo: {
    title: "Part II — Supervised internship",
    subtitle: "Supervised practice in a small cohort",
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
      name: "Self-paced primer",
      description: "Self-paced primer only.",
      includes: [],
    },
    complete: {
      name: "Supervised internship",
      description: "Supervised internship cohort.",
      includes: [],
      primary: true,
    },
  },
  faq: [
    {
      question: "Do I need a psychology background?",
      answer:
        "The self-paced primer assumes no background and explains the field from the start. The supervised internship expects the foundations and is more demanding.",
    },
    {
      question: "Is the internship a job or a placement?",
      answer:
        "No. It is an educational, supervised internship with simulated practice. It is not employment, a placement with real clients, or a licence to practise.",
    },
    {
      question: "How much practice do I get?",
      answer:
        "Practice happens in live sessions with fictional and role-played cases, with feedback. Exactly how much depends on the cohort schedule shown on this page and at checkout.",
    },
    {
      question: "Is the internship recorded?",
      answer:
        "The internship is taught live. Replay access is only offered if the specific cohort includes recordings and The Mind Point has approved that benefit.",
    },
    {
      question: "Does this qualify me to practise?",
      answer:
        "No. It builds knowledge and skill, but it is not a degree, a licence or registration with a statutory council, and it does not by itself qualify you to practise independently where local law requires registration.",
    },
    {
      question: "How do I know the price, dates and requirements?",
      answer:
        "These are shown from the current enrolment option and cohort details on the page and at checkout. This description is not a substitute for those live details.",
    },
  ],
  disclaimer:
    "Educational supervised internship. Practice is simulated or role-played. This programme is not employment, not a placement with real clients, and does not confer an independent clinical qualification.",
  cta: {
    heading: "Understand the field, then practise with supervision.",
    body: "Begin with the self-paced primer, or come with the foundations and join a supervised cohort to practise counselling skills with feedback and guidance.",
    primaryLabel: "Explore course options",
    secondaryLabel: "Talk to us on WhatsApp",
    secondaryHref:
      "https://wa.me/919137008686?text=Hi%2C%20I%20have%20a%20question%20about%20the%20Counselling%20Psychology%20internship.",
  },

  layout: "brief",
  hero: {
    eyebrow: "The Mind Point supervised programme",
    title: "Counselling Psychology Internship",
    supporting:
      "Move from learning counselling to practising counselling skills, with supervision.",
    description:
      "Choose the self-paced primer to understand the difference between clinical and counselling psychology, or join a supervised cohort where you practise listening, reflecting, questioning and structuring a session with fictional and role-played cases. Small groups and clear boundaries keep the practice honest and the feedback useful.",
    primaryCta: { label: "Explore course options", href: "#options" },
    secondaryCta: { label: "See what you will learn", href: "#outcomes" },
    scopeLine:
      "Supervised, simulated practice. This programme does not confer an independent clinical qualification.",
  },

  overview: {
    eyebrow: "The programme in one view",
    stages: [
      {
        label: "Primer — Self-paced",
        title: "Understand clinical versus counselling psychology",
        body: "A recorded primer that explains what counselling psychology is, how it differs from clinical psychology, what counselling can help with, and why scope and referral matter. Ideal if you want the foundations before committing to a supervised cohort.",
      },
      {
        label: "Internship — Supervised cohort",
        title: "Practise counselling skills with feedback",
        body: "A live, supervised cohort built around core counselling skills, taking a history, building a shared understanding, and ethical practice. Practice uses fictional and role-played cases with faculty feedback and supervision. Teaching happens live; this is not a pre-recorded package.",
      },
    ],
    progression:
      "First understand where counselling fits. Then practise the skills, present your work in supervision, and revise your approach with feedback.",
  },

  howItWorks: {
    title: "How the learning works",
    steps: [
      {
        title: "Start with the field, at your pace.",
        body: "The primer gives a clear, honest account of counselling psychology and its relationship to clinical psychology, so you know what you are training towards before you practise.",
      },
      {
        title: "Practise the core skills.",
        body: "In the cohort you practise listening, reflecting, questioning and structuring a session with role-played and fictional cases, and you receive feedback on your reasoning and your manner.",
      },
      {
        title: "Present your work in supervision.",
        body: "You bring your practice to supervision, receive feedback, and revise your approach. Learning is evaluated through reasoning, ethics and responsible limits, not recall alone.",
      },
    ],
  },

  audienceGroups: [
    {
      title: "Curious about counselling?",
      body: "Take the primer to understand what counselling psychology is and where it fits, without committing to a supervised cohort.",
    },
    {
      title: "Studying psychology?",
      body: "Connect your studies to practice: skills, session structure, case history and the ethical questions that come with them.",
    },
    {
      title: "Already helping people?",
      body: "Sharpen the core skills, revisit ethics and boundaries, and use supervision to test and improve your reasoning.",
    },
    {
      title: "Changing field?",
      body: "Get a serious introduction to the profession and a supervised route into practising the basics, with honest limits stated throughout.",
    },
  ],

  curriculum: {
    eyebrow: "What you will cover",
    title: "The two routes",
    stages: [
      {
        key: "introductory",
        label: "Self-paced primer",
        shortLabel: "Primer",
        kind: "self-paced",
        blurb:
          "A recorded primer on counselling psychology and its relationship to clinical psychology, studied at your own pace.",
        formatNote:
          "Recorded lessons, student reading notes, fictional examples and reflection prompts at your own pace.",
        items: [
          {
            title: "Clinical versus counselling psychology",
            body: "Where the two fields overlap and where they differ, and how that shapes the work you do.",
          },
          {
            title: "What counselling can and cannot help with",
            body: "The realistic scope of counselling, common misconceptions, and why some difficulties need something else.",
          },
          {
            title: "The counselling relationship",
            body: "Why the relationship itself is central, and what a working alliance requires from the practitioner.",
          },
          {
            title: "Scope, ethics and referral",
            body: "Why professional boundaries matter, what a practitioner must not do, and when to refer on.",
          },
        ],
      },
      {
        key: "applied",
        label: "Supervised internship",
        shortLabel: "Internship",
        kind: "live",
        blurb:
          "A live, supervised cohort built around core counselling skills, case history and ethical practice with fictional and role-played cases.",
        formatNote:
          "Live faculty-led teaching, guided practice, role-play, supervised case discussion, feedback and a separate student reading manual.",
        items: [
          {
            title: "Core counselling skills",
            body: "Listening, reflecting, paraphrasing, questioning and the discipline of not rushing to advice.",
          },
          {
            title: "Structuring a session",
            body: "Opening, focusing, working and closing a session in a way that serves the person.",
          },
          {
            title: "Taking a history and building understanding",
            body: "Gathering what matters, noticing what is not said, and building a shared picture of the difficulty.",
          },
          {
            title: "Working with emotion",
            body: "Staying with strong feeling, and knowing your limits and when to draw on supervision.",
          },
          {
            title: "Risk, ethics and boundaries",
            body: "Recognising risk, holding boundaries and responding ethically when a situation is difficult.",
          },
          {
            title: "Referral and multi-disciplinary working",
            body: "When and how to refer on, and how to work alongside other professionals.",
          },
          {
            title: "Using supervision well",
            body: "Presenting your work, receiving feedback, and turning it into a change in practice.",
          },
          {
            title: "Integration and honest review",
            body: "Review your development, acknowledge the limits of the internship, and plan what comes next.",
          },
        ],
      },
    ],
  },

  materials: {
    eyebrow: "Included learning materials",
    title: "What is supplied for each route",
    items: [
      {
        label: "Primer recorded lessons and student notes",
        note: "Supplied with the self-paced route.",
      },
      {
        label: "Internship student reading notes",
        note: "Supplied separately from the live faculty guide.",
      },
      {
        label: "Role-played and fictional case material",
        note: "Within the supervised cohort.",
      },
      {
        label: "Live supervised practice and feedback",
        note: "According to the actual cohort schedule and enrolment option.",
      },
    ],
    note: "The faculty guide is an internal teaching document, not a downloadable student benefit.",
  },

  assessment: {
    eyebrow: "Assessment and completion",
    title: "How you are assessed",
    body: "The primer includes reflection prompts so learners can confirm their understanding. The internship is assessed through supervised practice, case discussion and feedback on your reasoning and ethical judgement.",
  },

  options: {
    eyebrow: "Course options",
    title: "Choose your route",
    items: [
      {
        key: "self-paced",
        name: "Option A — Self-paced primer",
        bestFor:
          "Anyone who wants to understand counselling psychology, and the difference from clinical psychology, before committing to a supervised cohort.",
        includes: [
          "Recorded primer lessons",
          "Student reading notes",
          "Subject to the actual LMS release state",
        ],
        outcome:
          "Explain where counselling fits, what it can help with, and why scope, ethics and referral matter.",
        cta: { label: "Choose self-paced primer", state: "enroll" },
        catalogueCode: "PRCVCP",
        upgradeNote:
          "Upgrade to the supervised internship later by paying the difference.",
      },
      {
        key: "applied",
        name: "Option B — Supervised internship",
        bestFor:
          "Learners with the foundations who want to practise counselling skills with feedback and supervision.",
        includes: [
          "Live supervised sessions",
          "Internship student notes",
          "Subject to the actual cohort schedule",
        ],
        outcome:
          "Practise core counselling skills, session structure, case history and ethical decision-making with supervision.",
        cta: { label: "Join the internship cohort", state: "enroll" },
        catalogueCode: "INCLP",
      },
    ],
  },

  closing: {
    heading: "Understand the field, then practise with supervision.",
    body: "The Mind Point offers a self-paced primer and a supervised cohort. Start where you are, and move into supervised practice when you are ready to present your work, take feedback and revise your approach.",
    ctaLabel: "Explore course options",
    ctaHref: "#options",
    scopeLine:
      "Supervised, simulated practice. Real clinical work requires the appropriate qualifications, consent and supervision.",
  },

  campaign: true,
  order: 4,
};
