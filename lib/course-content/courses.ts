import type { CourseContent, CoursePartOne, CoursePartTwo } from "@/lib/course-content/types";
import { cbtRebtCbmt } from "@/lib/course-content/cbt-rebt-cbmt";

/** Formats present in every Part I (self-paced) experience. */
const FOUNDATIONS_FORMATS = [
  "Video lessons",
  "Written notes",
  "Diagrams",
  "Worked examples",
  "Knowledge checks",
  "Reflections",
  "Case Room exercises",
  "Downloadable tools",
  "Final assessment",
];

/** Formats present in every Part II (faculty-led) experience. */
const APPLIED_FORMATS = [
  "Advanced live teaching",
  "Demonstrations",
  "Case discussions",
  "Guided practice",
  "Role-play",
  "Q&A",
  "Faculty feedback",
  "Applied assessment",
];

const FOUNDATIONS_INCLUDES = [
  "Every Part I self-paced module",
  "Knowledge checks and reflections",
  "Case Room exercises",
  "Downloadable tools and templates",
  "Final assessment",
  "Certificate of completion",
];

const COMPLETE_INCLUDES = [
  "Everything in Foundations",
  "Live Part II cohort with faculty",
  "Demonstrations and case discussions",
  "Guided practice, role-play and Q&A",
  "Faculty feedback on your work",
  "Applied assessment",
  "Course certificate plus a Supervised Practice certificate",
];

const STANDARD_FAQS = [
  {
    question: "How do the two parts fit together?",
    answer:
      "Part I is self-paced and available as soon as you enrol. Part II is a scheduled, faculty-led cohort. You can begin Part I now and join the next live cohort when it suits you.",
  },
  {
    question: "Can I upgrade from Foundations to Complete Training?",
    answer:
      "Yes. Start with the self-paced Foundations, and upgrade to a future live cohort by paying only the difference.",
  },
  {
    question: "Are the live classes recorded?",
    answer:
      "Live classes are recorded for your cohort and available stream-only for twelve months from course completion.",
  },
  {
    question: "Does this qualify me to practise?",
    answer:
      "This is an educational programme. It builds knowledge and skill, but it is not a degree, a licence, or registration with a statutory council, and it does not by itself qualify you to practise independently where local law requires registration.",
  },
];

const DISCLAIMER =
  "The Mind Point programmes are educational. They are not a degree, a licence, or registration with a statutory council, and they do not by themselves qualify you to practise independently where local law requires registration. Nothing on this page is medical or psychological advice.";

function foundations(subtitle: string): CoursePartOne {
  return {
    title: "Part I — Foundations",
    subtitle,
    formats: FOUNDATIONS_FORMATS,
    modules: [],
    assessment: "A final assessment you complete at your own pace.",
  };
}

function applied(subtitle: string): CoursePartTwo {
  return {
    title: "Part II — Applied Training",
    subtitle,
    formats: APPLIED_FORMATS,
    sessions: [],
    assessment: "An applied assessment reviewed by faculty.",
  };
}

export const courses: CourseContent[] = [
  cbtRebtCbmt,
  {
    slug: "inner-child-healing",
    title: "Inner Child Healing",
    shortTitle: "Inner Child Healing",
    category: "Certificate programme",
    tagline:
      "Understand what we carry. Explore where it began. Learn healthier ways of responding today.",
    description:
      "How childhood experiences shape adult life, and trauma-informed ways to nurture and reconnect with the inner child.",
    heroCopy:
      "A gentle, structured way to understand the patterns we carry into adulthood, and to respond to them with more care.",
    learningOutcomes: [],
    audience: [],
    prerequisites: [],
    partOne: foundations("Learn in your own space."),
    partTwo: applied("Learn with faculty. Practise with people."),
    caseRoom: [],
    toolkit: [],
    faculty: [],
    duration: "6 weeks",
    weeklyCommitment: undefined,
    selfPacedStart: "Start anytime",
    liveStart: "2027-01-12",
    cohortSize: 30,
    certificateFoundation: "A certificate of completion for the Part I modules.",
    certificateComplete:
      "A course certificate plus a Supervised Practice certificate. Practice is simulated; the certificate says so.",
    pricing: {
      foundation: {
        name: "Foundations",
        description: "Self-paced course only.",
        includes: FOUNDATIONS_INCLUDES,
        upgradeNote:
          "Upgrade to a future live cohort by paying only the difference.",
      },
      complete: {
        name: "Complete Training",
        description: "Part I plus the live Part II cohort.",
        includes: COMPLETE_INCLUDES,
        primary: true,
      },
    },
    faq: STANDARD_FAQS,
    disclaimer: DISCLAIMER,
    cta: {
      heading: "Understand what you carry. Learn a kinder response.",
      body: "Start self-paced today, or join the January live cohort.",
      primaryLabel: "Choose how you train",
      secondaryLabel: "Talk to us on WhatsApp",
      secondaryHref:
        "https://wa.me/919137008686?text=Hi%2C%20I%20have%20a%20question%20about%20the%20Inner%20Child%20Healing%20programme.",
    },
    campaign: true,
    order: 2,
  },
  {
    slug: "personality-disorders",
    title: "Personality Disorders",
    shortTitle: "Personality Disorders",
    category: "Certificate programme",
    tagline:
      "Move beyond labels. Understand patterns, formulation and the person behind the diagnosis.",
    description:
      "How personality disorders are classified, assessed and understood, and how to work with them ethically, without stigma.",
    heroCopy:
      "A formulation-first look at personality disorders, held with the person, not just the label, at the centre.",
    learningOutcomes: [],
    audience: [],
    prerequisites: [],
    partOne: foundations("Learn the frameworks in your own space."),
    partTwo: applied("Learn with faculty. Practise with people."),
    caseRoom: [],
    toolkit: [],
    faculty: [],
    duration: "8 weeks",
    weeklyCommitment: undefined,
    selfPacedStart: "Start anytime",
    liveStart: "2027-01-12",
    cohortSize: 30,
    certificateFoundation: "A certificate of completion for the Part I modules.",
    certificateComplete:
      "A course certificate plus a Supervised Practice certificate. Practice is simulated; the certificate says so.",
    pricing: {
      foundation: {
        name: "Foundations",
        description: "Self-paced course only.",
        includes: FOUNDATIONS_INCLUDES,
        upgradeNote:
          "Upgrade to a future live cohort by paying only the difference.",
      },
      complete: {
        name: "Complete Training",
        description: "Part I plus the live Part II cohort.",
        includes: COMPLETE_INCLUDES,
        primary: true,
      },
    },
    faq: STANDARD_FAQS,
    disclaimer: DISCLAIMER,
    cta: {
      heading: "Move beyond labels.",
      body: "Start self-paced today, or join the January live cohort.",
      primaryLabel: "Choose how you train",
      secondaryLabel: "Talk to us on WhatsApp",
      secondaryHref:
        "https://wa.me/919137008686?text=Hi%2C%20I%20have%20a%20question%20about%20the%20Personality%20Disorders%20programme.",
    },
    campaign: true,
    order: 3,
  },
  {
    slug: "counselling-internship",
    title: "Counselling Internship",
    shortTitle: "Counselling Internship",
    category: "Applied internship",
    tagline:
      "Move from learning counselling to practising counselling skills.",
    description:
      "A supervised, cohort-based internship for people who have the foundations and want to practise under guidance.",
    heroCopy:
      "This is a supervised internship, not a self-paced course. Places are offered by application so that supervision and group size stay workable.",
    learningOutcomes: [],
    audience: [],
    prerequisites: [],
    partOne: foundations("Preparation before you begin."),
    partTwo: applied("Supervised practice in a small cohort."),
    caseRoom: [],
    toolkit: [],
    faculty: [],
    duration: undefined,
    weeklyCommitment: undefined,
    selfPacedStart: undefined,
    liveStart: undefined,
    cohortSize: undefined,
    certificateFoundation: undefined,
    certificateComplete: undefined,
    pricing: {
      foundation: {
        name: "Application",
        description: "This programme is offered by application.",
        includes: [],
      },
      complete: {
        name: "Application",
        description: "This programme is offered by application.",
        includes: [],
      },
    },
    faq: STANDARD_FAQS,
    disclaimer: DISCLAIMER,
    cta: {
      heading: "Move from learning counselling to practising it.",
      body: "Places are limited and offered by application.",
      primaryLabel: "Start your application",
      secondaryLabel: "Talk to us on WhatsApp",
      secondaryHref:
        "https://wa.me/919137008686?text=Hi%2C%20I%20have%20a%20question%20about%20the%20Counselling%20Internship.",
    },
    applicationBased: true,
    campaign: true,
    order: 4,
  },
];
