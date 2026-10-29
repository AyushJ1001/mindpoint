import type { CourseContent } from "@/lib/course-content/types";

/**
 * PTSD & Complex Trauma — certificate-course page content.
 *
 * Operational facts come from the CCPTSD catalogue row: 2 February – 25 March
 * 2027, Tuesday and Thursday, 7:30–8:30 pm IST, sixteen sessions, ₹4,500.
 * The course is unpublished until faculty and curriculum review; the page says
 * plainly that it is educational and does not qualify anyone to diagnose or
 * treat trauma.
 */
export const ptsdComplexTrauma: CourseContent = {
  slug: "ptsd-complex-trauma",
  title: "Certificate Course in PTSD & Complex Trauma",
  shortTitle: "PTSD & Complex Trauma",
  category: "Applied certificate",
  tagline: "Understand trauma carefully, and learn to work within your scope.",
  description:
    "An eight-week certificate course on PTSD and complex trauma: how trauma is understood, assessed and formulated, with two weeks of faculty-curated practical application.",
  heroCopy:
    "Trauma asks for care before technique. This course builds a grounded understanding of PTSD and complex trauma, then gives you a practical fortnight to work through fictional cases with faculty feedback.",
  learningOutcomes: [
    "Describe trauma and distinguish it from stress and adversity.",
    "Use the diagnostic frameworks for PTSD and complex trauma carefully.",
    "Explain how prolonged or developmental trauma differs from single-incident trauma.",
    "Recognise somatic and nervous-system responses, and what they mean for pacing.",
    "Take a trauma-informed history and build a formulation rather than a label.",
    "Describe the main therapeutic approaches and what the evidence supports.",
    "Recognise risk, scope and the point at which to refer on.",
  ],
  audience: [
    "Psychology students and graduates building trauma-informed foundations.",
    "Counsellors and allied professionals refreshing their understanding.",
    "People considering further clinical training who want a rigorous first step.",
  ],
  prerequisites: ["None. No prior clinical training is required."],
  partOne: {
    title: "Weeks 1–6 · Structured learning",
    subtitle: "The frameworks, the evidence and the cautions.",
    formats: ["Live classes", "Reading notes", "Fictional cases"],
    modules: [
      { title: "Foundations of Psychological Trauma" },
      { title: "PTSD: Symptoms and Diagnostic Frameworks" },
      { title: "Complex PTSD and Developmental Trauma" },
      { title: "Trauma, the Nervous System and Somatic Manifestations" },
      { title: "Trauma-Informed Assessment and Case Formulation" },
      { title: "Evidence-Based Therapeutic Approaches" },
    ],
  },
  partTwo: {
    title: "Weeks 7–8 · Practical application",
    subtitle: "Faculty-curated practice on fictional material.",
    formats: ["Case discussion", "Guided exercises", "Feedback"],
    sessions: [
      "Case analysis and formulation",
      "Simulated practice, ethics and integration",
    ],
  },
  caseRoom: [
    {
      title: "A referral that does not fit one category",
      prompt:
        "A fictional client presents with both single-incident and developmental features. What would you want to know before forming a view?",
      sample: true,
    },
  ],
  toolkit: [
    { title: "Weekly reading notes", kind: "Notes" },
    { title: "Formulation worksheet", kind: "Worksheet" },
    { title: "Scope and referral checklist", kind: "Checklist" },
  ],
  faculty: [],
  duration: "8 weeks",
  liveStart: "2027-02-02",
  liveEnd: "2027-03-25",
  weeklyCommitment: "Two live sessions a week, plus reading",
  pricing: {
    foundation: {
      name: "Standard",
      includes: ["Eight live weeks", "Reading notes", "Certificate of completion"],
      price: 4500,
    },
    complete: {
      name: "Standard",
      includes: ["Eight live weeks", "Reading notes", "Certificate of completion"],
      price: 4500,
    },
  },
  faq: [
    {
      question: "Does this course qualify me to treat trauma?",
      answer:
        "No. It is an educational certificate. It does not confer a licence, registration or independent qualification to diagnose or treat PTSD, and it does not replace supervised clinical training.",
    },
    {
      question: "How much of the course is practical?",
      answer:
        "Six weeks build the frameworks; the final two are practical. Activities are curated by faculty and may vary by batch — case discussion, guided exercises, demonstrations and applied tasks are examples, not a fixed list.",
    },
    {
      question: "Are the cases real clients?",
      answer:
        "No. All cases are fictional, and practical work stays within an educational setting.",
    },
    {
      question: "Will I be able to revisit the sessions?",
      answer:
        "Yes, for eligible new registrations from 27 October 2026: recordings stay available for as long as the platform operates, with 90 days' notice and a download window if it ever closes.",
    },
  ],
  disclaimer:
    "This is an educational course. It does not authorise clinical practice, confer licensure, or qualify you to diagnose or treat PTSD or complex trauma. Faculty review of the curriculum and assigned teaching staff is pending.",
  cta: {
    heading: "Registrations open soon.",
    body: "The February 2027 cohort is confirmed. Enrolment opens once faculty and curriculum review are complete.",
    primaryLabel: "See the January courses",
    secondaryLabel: "Ask about this course",
    secondaryHref: "/contact",
  },
  campaign: false,
  order: 5,
  layout: "brief",
  hero: {
    eyebrow: "Certificate · February 2027",
    title: "PTSD & Complex Trauma",
    supporting: "Tuesday and Thursday · 7:30–8:30 pm IST",
    description:
      "An eight-week certificate course in how trauma is understood, assessed and formulated, with two weeks of faculty-curated practice.",
    primaryCta: { label: "Registrations open soon", href: "#overview" },
    secondaryCta: { label: "See the January courses", href: "/programs" },
  },
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
          "Six weeks of live classes: what trauma is, how PTSD and complex trauma are framed, how the body responds, and how to assess and formulate carefully.",
        formatNote: "Live teaching, reading notes, fictional cases.",
        items: [
          {
            title: "Foundations of Psychological Trauma",
            body: "What trauma is and is not, how it differs from stress, and the vocabulary of trauma-informed practice.",
          },
          {
            title: "PTSD: Symptoms, Diagnostic Frameworks and Clinical Presentation",
            body: "The diagnostic criteria, how presentation varies across people and contexts, and what a framework can and cannot tell you.",
          },
          {
            title: "Complex PTSD and Developmental Trauma",
            body: "Prolonged and relational trauma, why the distinction changes the work, and the debate around categories.",
          },
          {
            title: "Trauma, the Nervous System and Somatic Manifestations",
            body: "Threat responses, somatic presentations, and pacing as a clinical and ethical concern.",
          },
          {
            title: "Trauma-Informed Assessment and Case Formulation",
            body: "Taking a history carefully, recognising risk, and building an understanding rather than applying a label.",
          },
          {
            title: "Evidence-Based Therapeutic Approaches",
            body: "The main approaches, what the evidence supports, and where scope and supervision end.",
          },
        ],
      },
      {
        key: "practical",
        label: "Weeks 7–8 · Practical application",
        shortLabel: "Weeks 7–8",
        kind: "live",
        blurb:
          "Two weeks of faculty-curated practice on fictional material, with feedback on your reasoning.",
        formatNote: "Case discussion, simulations, reflective exercises.",
        items: [
          {
            title: "Practical Training: Case Analysis and Formulation",
            body: "Work through fictional cases, build a formulation and defend your reasoning.",
          },
          {
            title: "Practical Training: Simulations, Ethics and Integration",
            body: "Simulated practice, ethical decision-making, and pulling the eight weeks together.",
          },
        ],
      },
    ],
  },
  materials: {
    eyebrow: "Materials",
    title: "What you take away",
    items: [
      { label: "Weekly reading notes" },
      { label: "Formulation worksheet" },
      { label: "Scope and referral checklist" },
      { label: "Certificate of completion" },
    ],
  },
};
