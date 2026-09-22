// Content for the standalone "CBT, REBT & CBMT" course landing page.
//
// This mirrors the course record created by
// `convex/bootstrapCbtRebtCbmt.ts`. Keep the two in sync when the copy changes.

import type { CbtLandingOverride } from "./site-content";

export interface CbtModule {
  title: string;
  description: string;
}

export interface CbtFaq {
  question: string;
  answer: string;
}

export interface CbtWhoItem {
  title: string;
  description: string;
}

export const cbtRebtCbmt = {
  slug: "cbt-rebt-cbmt",
  code: "CCBT3",
  name: "CBT, REBT & CBMT",
  eyebrow: "Live certificate course",
  tagline: "Three approaches. One coherent way to work.",
  description:
    "An eight-week live certificate covering the three core cognitive and behavioural approaches — CBT, REBT and CBMT — and how to use them with real clients, in a small supervised group.",
  proof: [
    "Live, small cohorts — capped for real practice",
    "Taught by practising clinicians",
    "All three approaches, joined up",
    "Certificate that states completion honestly",
  ],
  painPoints: [
    "CBT, REBT and CBMT are usually taught separately and never joined up.",
    "Most courses stop at theory and never put you in the room.",
    "You want skills you can actually use with a client, not just notes.",
    "You're not sure which approach to reach for — or how to combine them safely.",
  ],
  outcomes: [
    "You can explain the cognitive model plainly.",
    "You can challenge a thought without arguing with the person.",
    "You can use REBT's disputation and CBMT's mindfulness.",
    "You can choose an approach for the person in front of you.",
    "You know your scope — and when to refer on.",
  ],
  learningOutcomes: [
    "Explain the cognitive model and where it fits",
    "Challenge and restructure unhelpful thinking",
    "Use REBT's disputation with real clients",
    "Weave mindfulness into behavioural work",
    "Work safely within your scope of practice",
  ],
  modules: [
    {
      title: "Foundations of CBT",
      description:
        "The cognitive model — thoughts, emotions and behaviour. Where CBT came from, what the evidence supports, and where it is thin.",
    },
    {
      title: "Cognitive restructuring",
      description:
        "Identifying and challenging cognitive distortions, and building a shared formulation with a client.",
    },
    {
      title: "Behavioural work",
      description:
        "Behavioural activation, exposure and graded tasks, applied carefully and with consent.",
    },
    {
      title: "REBT: rational emotive behaviour therapy",
      description:
        "The ABC model, irrational beliefs and disputation. How REBT differs from and complements CBT.",
    },
    {
      title: "CBMT: mindfulness in practice",
      description:
        "Bringing mindfulness into cognitive and behavioural work — attention, acceptance and present-moment practice.",
    },
    {
      title: "Working across the three",
      description:
        "Choosing an approach for the person in front of you, and combining them without muddle.",
    },
    {
      title: "Supervised practice",
      description:
        "Role-played and simulated sessions with feedback, so you build confidence before real clients.",
    },
    {
      title: "Integration and next steps",
      description:
        "Pulling it together, a development plan, and the honest limits of the certificate.",
    },
  ] as CbtModule[],
  whoItsFor: [
    {
      title: "Psychology students",
      description:
        "You want clinical skills your degree hasn't given you yet — and a real sense of what the work feels like.",
    },
    {
      title: "Early-career counsellors",
      description:
        "You want a toolkit you can actually reach for in the room, not just theory on a slide.",
    },
    {
      title: "Career changers",
      description:
        "You're moving into mental health work and want a serious, supervised foundation to build on.",
    },
    {
      title: "Practising professionals",
      description:
        "You want CBT, REBT and CBMT joined up instead of taught in disconnected silos.",
    },
  ] as CbtWhoItem[],
  whyDifferent: [
    "All three approaches in one coherent certificate.",
    "Live, small cohorts with real practice and feedback.",
    "Taught by practising clinicians, not marketers.",
    "A certificate that states completion honestly.",
  ],
  faqs: [
    {
      question: "Do I need prior clinical experience?",
      answer:
        "No. It's open to psychology students, graduates and practising counsellors. You'll practise in a supervised setting before working with real clients.",
    },
    {
      question: "Are CBT, REBT and CBMT taught separately?",
      answer:
        "No — that's the point. You'll learn each approach and, crucially, how to choose and combine them for the person in front of you.",
    },
    {
      question: "Is there supervised practice?",
      answer:
        "Yes. You'll work through role-played and simulated sessions with feedback, so you build confidence before real clients.",
    },
    {
      question: "What certificate do I get?",
      answer:
        "A certificate of completion from The Mind Point, with honest wording about what it is — a professional learning credential, not a licence to practise.",
    },
    {
      question: "How much time does it take each week?",
      answer:
        "Live sessions run twice a week, with practice between them. It's built for people studying or working alongside.",
    },
  ] as CbtFaq[],
  closing: {
    headline: "Learn the three approaches that should be taught together.",
    body: "Join the next cohort, or ask us anything before you enrol.",
    primaryLabel: "Enrol now",
    primaryFallbackLabel: "Register your interest",
    secondaryLabel: "Talk to an advisor",
    secondaryHref: "/contact",
  },
};

/**
 * Layer an admin-authored override over the code defaults. Unset or empty
 * fields fall back to the defaults so a partial override never blanks a
 * section.
 */
export function resolveCbtRebtCbmt(override?: CbtLandingOverride | null) {
  if (!override) return cbtRebtCbmt;

  return {
    ...cbtRebtCbmt,
    name: override.name ?? cbtRebtCbmt.name,
    eyebrow: override.eyebrow ?? cbtRebtCbmt.eyebrow,
    tagline: override.tagline ?? cbtRebtCbmt.tagline,
    description: override.description ?? cbtRebtCbmt.description,
    proof: override.proof?.length ? override.proof : cbtRebtCbmt.proof,
    painPoints: override.painPoints?.length
      ? override.painPoints
      : cbtRebtCbmt.painPoints,
    outcomes: override.outcomes?.length
      ? override.outcomes
      : cbtRebtCbmt.outcomes,
    learningOutcomes: override.learningOutcomes?.length
      ? override.learningOutcomes
      : cbtRebtCbmt.learningOutcomes,
    whyDifferent: override.whyDifferent?.length
      ? override.whyDifferent
      : cbtRebtCbmt.whyDifferent,
    modules: override.modules?.length
      ? override.modules.map((module) => ({
          title: module.title,
          description: module.description,
        }))
      : cbtRebtCbmt.modules,
    whoItsFor: override.whoItsFor?.length
      ? override.whoItsFor.map((item) => ({
          title: item.title,
          description: item.description,
        }))
      : cbtRebtCbmt.whoItsFor,
    faqs: override.faqs?.length ? override.faqs : cbtRebtCbmt.faqs,
    closing: { ...cbtRebtCbmt.closing, ...(override.closing ?? {}) },
  };
}

export type CbtRebtCbmtContent = ReturnType<typeof resolveCbtRebtCbmt>;
