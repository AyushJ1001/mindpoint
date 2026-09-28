// SEO guides for the resources hub. Each is genuinely educational, honest about
// what The Mind Point certificates are and are not, and points at a relevant
// next step. Content lives here so the index, the pages and their structured
// data stay in step.

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface Guide {
  slug: string;
  /** On-page H1. */
  title: string;
  /** Browser/SEO title. */
  metaTitle: string;
  description: string;
  /** Short standfirst under the H1. */
  intro: string;
  readMinutes: number;
  updated: string;
  sections: GuideSection[];
  faq: GuideFaq[];
  cta: {
    label: string;
    href: string;
    note: string;
  };
}

export const GUIDES: Guide[] = [
  {
    slug: "stop-overthinking",
    title: "Why can't I stop overthinking?",
    metaTitle: "Why can't I stop overthinking — and what actually helps",
    description:
      "Overthinking is a loop, not a personality. A clear, practical guide to why the mind circles and the evidence-based things that help you step out of it.",
    intro:
      "Overthinking feels productive. It promises that if you just run the scenario one more time, you'll reach certainty. You rarely do. Here is what is happening, and what tends to help.",
    readMinutes: 6,
    updated: "September 2026",
    sections: [
      {
        heading: "The loop, briefly",
        paragraphs: [
          "Most overthinking is a behaviour the mind learned because it reduced discomfort in the short term. Worrying feels like preparing. Rumination feels like solving. Both give a small hit of control, so the mind returns to them the next time uncertainty shows up.",
          "The trap is that the loop is unfalsifiable. There is always one more angle, one more what-if. The mind treats the absence of a perfect answer as evidence it should keep going.",
        ],
      },
      {
        heading: "Distinguish rumination from problem-solving",
        paragraphs: [
          "One question sorts most of it out: is there a concrete action I can take today?",
        ],
        bullets: [
          "If yes — write the action, schedule it, and stop rehearsing it.",
          "If no — the loop is rumination, and no amount of thinking will close it. The move is to relate to the thought differently, not to finish it.",
        ],
      },
      {
        heading: "What actually helps",
        paragraphs: [
          "Cognitive behavioural approaches are the most studied here, and the core skills are teachable.",
        ],
        bullets: [
          "Name the thought, then test it. 'I will fail' is a prediction, not a fact. What is the evidence for and against?",
          "Separate the event from the story. A delayed reply is a delayed reply; 'they are angry with me' is an added interpretation.",
          "Change the behaviour, not just the thought. Avoidance keeps the loop alive. A small, planned exposure starves it.",
          "Put a container around worry. Fifteen minutes, same time daily, then return to the day.",
          "Get your body out of the loop: sleep, movement and breathing regulate the state the thoughts run on.",
        ],
      },
      {
        heading: "When to get help",
        paragraphs: [
          "Self-help is a good first step and a poor final one. If the loop is costing you sleep, work or relationships, or if it comes with low mood that won't lift, speak to a qualified professional. Therapy is not a last resort; it is a faster route than white-knuckling it.",
          "This guide is education, not treatment or diagnosis. If you are in crisis, contact a local emergency service or a mental-health helpline straight away.",
        ],
      },
    ],
    faq: [
      {
        q: "Is overthinking the same as anxiety?",
        a: "Not exactly. Overthinking is a pattern of thinking; anxiety is a broader state that often includes it. They frequently occur together, and the skills that help overlap.",
      },
      {
        q: "Can I stop overthinking on my own?",
        a: "Many people make real progress with structured self-help, especially if they practise the skills rather than just read them. If it isn't shifting, a therapist can help you find what is maintaining the loop.",
      },
      {
        q: "Do I need a psychology background to learn CBT skills?",
        a: "No. The foundations of CBT are teachable to anyone, which is exactly what our self-paced intro course is for.",
      },
    ],
    cta: {
      label: "Start with the CBT, REBT & CBMT intro",
      href: "/courses/intro",
      note: "A ₹999 self-paced introduction to the ideas in this guide.",
    },
  },
  {
    slug: "choosing-a-psychology-course",
    title: "How to choose a psychology course in India",
    metaTitle:
      "How to choose a psychology course in India — without being misled",
    description:
      "Questions to ask, red flags to watch for, and what a certificate honestly means. A calm, practical checklist for choosing a psychology course in India.",
    intro:
      "The psychology course market in India is crowded, and the language is often inflated. These are the questions worth asking before you pay — and the claims worth pausing on.",
    readMinutes: 7,
    updated: "September 2026",
    sections: [
      {
        heading: "Start with what you actually want",
        paragraphs: [
          "Courses solve different problems. Decide which one you have before you compare prices.",
        ],
        bullets: [
          "Understanding yourself better — a short, low-cost intro is enough.",
          "Testing a career direction — an intro course plus a real conversation with a practitioner.",
          "Practising clinically — this needs supervised practice, usually far more than a single certificate.",
          "Formal qualification — a university degree or diploma, not a private certificate, is the route.",
        ],
      },
      {
        heading: "Questions worth asking",
        paragraphs: [
          "A provider that answers these clearly is worth your attention. Vague answers are information too.",
        ],
        bullets: [
          "Who teaches, and what are their qualifications and practice hours?",
          "Is the teaching live, recorded, or both — and for how long can I watch a recording?",
          "How many learners are in a cohort, and how much individual feedback will I get?",
          "What exactly does the certificate state, word for word?",
          "Is the certificate publicly verifiable?",
          "What is the refund and transfer policy, in plain language?",
        ],
      },
      {
        heading: "Red flags",
        paragraphs: [
          "Most of these are not illegal. They are simply signs the offer is being sold harder than it can be delivered.",
        ],
        bullets: [
          "A 'recognised' or 'accredited' degree from a body you can't verify.",
          "Guaranteed jobs, placements or income.",
          "Lifetime access promises with no explanation of who pays for hosting and support.",
          "Urgency that resets — countdowns that never actually end.",
          "No named faculty, no syllabus, no sample of the teaching.",
        ],
      },
      {
        heading: "What a certificate honestly means",
        paragraphs: [
          "A completion certificate from a private provider documents that you finished a training programme. It is not a degree, a licence, or a protected professional title. When a provider says otherwise, treat it as a warning.",
          "That said, a well-run certificate can be genuinely useful: it structures your learning, gives you practice and feedback, and signals to yourself (and sometimes to employers) that you made a serious start.",
        ],
      },
    ],
    faq: [
      {
        q: "Is a psychology certificate the same as a degree?",
        a: "No. A private certificate records completion of a training programme. Only a recognised university can award a degree or diploma recognised for regulated practice.",
      },
      {
        q: "Do I need to be RCI-registered to practise?",
        a: "Regulation in India depends on the role and the setting, and it is changing. Check the current requirements for your intended work with a qualified professional before you invest in training.",
      },
      {
        q: "How do I verify a The Mind Point certificate?",
        a: "Every certificate carries a public verification code you can check in seconds at our verification page.",
      },
    ],
    cta: {
      label: "See the January 2027 cohorts",
      href: "/january-2027",
      note: "Small live cohorts, honest certificates, public verification.",
    },
  },
  {
    slug: "cbt-exercises",
    title: "Three CBT exercises for anxiety and overthinking",
    metaTitle: "CBT exercises for anxiety and overthinking (free tool pack)",
    description:
      "Three core cognitive behavioural exercises — the thought record, the behavioural experiment and decatastrophising — explained simply, with how to actually use them.",
    intro:
      "CBT is not positive thinking. It is a set of practical experiments you run on your own thoughts. These three are the workhorses, and you can start with them today.",
    readMinutes: 6,
    updated: "September 2026",
    sections: [
      {
        heading: "1. The thought record",
        paragraphs: [
          "A thought record slows a hot moment down into five columns. The point is not to argue with yourself, but to test whether the thought survives contact with evidence.",
        ],
        bullets: [
          "Situation — what happened, factually.",
          "Thought — what went through your mind, in words.",
          "Emotion — name it and rate it out of ten.",
          "Evidence for and against the thought.",
          "A balanced alternative, and the emotion rating again.",
        ],
      },
      {
        heading: "2. The behavioural experiment",
        paragraphs: [
          "Much of anxiety is a prediction that has never been tested, because avoidance prevents the test. A behavioural experiment turns the prediction into something you can run.",
          "Write the prediction precisely ('if I speak up in the meeting, I will freeze and everyone will notice'), decide what would count as disconfirming evidence, then do it and record what actually happened. Predictions are usually more catastrophic than reality.",
        ],
      },
      {
        heading: "3. Decatastrophising",
        paragraphs: [
          "When the mind jumps to the worst case, follow it deliberately rather than resisting it.",
        ],
        bullets: [
          "What is the worst that could realistically happen?",
          "How would I cope if it did?",
          "What is the most likely outcome?",
          "Would I still be okay in a week, a month, a year?",
        ],
      },
      {
        heading: "Using them well",
        paragraphs: [
          "Practise on small, mildly uncomfortable situations first, and write things down rather than doing it in your head — the paper is what stops the loop from editing the evidence. If you notice the exercises are hard to start or don't shift anything, that is useful information, and a therapist can help you tailor them.",
          "This is education, not treatment. If you are in crisis, contact a local emergency service or a mental-health helpline immediately.",
        ],
      },
    ],
    faq: [
      {
        q: "How long do CBT exercises take to work?",
        a: "Most people notice a difference within a few weeks of regular practice. Consistency matters more than intensity.",
      },
      {
        q: "Can I do these without a therapist?",
        a: "Yes, many people do. A therapist helps when the pattern is complex, long-standing, or tied to low mood.",
      },
      {
        q: "Where can I learn CBT properly?",
        a: "Our self-paced intro course covers the history and core skills of CBT, REBT and CBMT, and the live applied cohort takes it into practice.",
      },
    ],
    cta: {
      label: "Learn the foundations properly",
      href: "/courses/intro",
      note: "The ₹999 self-paced intro to CBT, REBT and CBMT.",
    },
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function guideSlugs(): string[] {
  return GUIDES.map((guide) => guide.slug);
}
