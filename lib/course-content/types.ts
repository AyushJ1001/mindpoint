/**
 * Structured content model for the premium CoursePage system.
 *
 * Content lives here as data, never inline in page components. Any field that
 * is not yet supplied by the CMS/owner is optional and renders as a clearly
 * marked placeholder rather than invented copy.
 */

export interface CourseModule {
  title: string;
  summary?: string;
  lessons?: string[];
}

export interface CoursePartOne {
  title: string;
  subtitle: string;
  /** What the self-paced part contains (formats, not modules). */
  formats: string[];
  modules: CourseModule[];
  assessment?: string;
}

export interface CoursePartTwo {
  title: string;
  subtitle: string;
  /** What the live cohort contains (formats, not sessions). */
  formats: string[];
  sessions: string[];
  assessment?: string;
}

export interface CaseRoomExercise {
  title: string;
  /** Present the scenario to react to. */
  prompt: string;
  /** Optional answer options for the interactive preview. */
  options?: string[];
  /** Index of the correct option, when options are provided. */
  correctIndex?: number;
  /** Explanation shown after answering. */
  explanation?: string;
  /**
   * True when this is illustrative sample content rather than a real course
   * exercise. Rendered with an explicit "illustrative sample" label.
   */
  sample?: boolean;
}

export interface ToolkitItem {
  title: string;
  description?: string;
  /** e.g. Worksheet, Template, Checklist, Reference. */
  kind?: string;
}

export interface FacultyMember {
  /** Omit until a named faculty member is confirmed. */
  name?: string;
  role?: string;
  qualification?: string;
  bio?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PricingTier {
  name: string;
  description?: string;
  includes: string[];
  /** Omit until pricing is decided; renders a placeholder. */
  price?: number;
  priceNote?: string;
  primary?: boolean;
  /** e.g. "Upgrade later by paying only the difference." */
  upgradeNote?: string;
}

export interface CourseCta {
  heading: string;
  body?: string;
  primaryLabel: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

/* ------------------------------------------------------------------ */
/*  Rich programme-page model (used when layout is "brief").           */
/*  Operational facts (price, dates, seats, faculty, checkout URLs)    */
/*  are optional and are only rendered when actually configured.       */
/* ------------------------------------------------------------------ */

export interface LinkCta {
  label: string;
  href: string;
}

export interface ProgrammeHero {
  eyebrow: string;
  title: string;
  supporting: string;
  description: string;
  primaryCta: LinkCta;
  secondaryCta?: LinkCta;
  scopeLine?: string;
}

export interface OverviewStage {
  label: string;
  title: string;
  body: string;
}

export interface ProgrammeOverview {
  eyebrow?: string;
  title?: string;
  stages: OverviewStage[];
  progression: string;
}

export interface ProgrammeStep {
  title: string;
  body: string;
}

export interface AudienceGroup {
  title: string;
  body: string;
}

export interface CurriculumItem {
  title: string;
  body: string;
}

export interface CurriculumStage {
  key: string;
  label: string;
  /** Short label kept visible on narrow screens. */
  shortLabel: string;
  kind: "self-paced" | "live";
  blurb: string;
  /** Rendered only when the LMS/cohort config supplies it. */
  formatNote?: string;
  items: CurriculumItem[];
}

export interface ProgrammeCurriculum {
  eyebrow?: string;
  title?: string;
  stages: CurriculumStage[];
}

export interface LearningMaterial {
  label: string;
  note?: string;
}

export interface ProgrammeMaterials {
  eyebrow?: string;
  title?: string;
  items: LearningMaterial[];
  note?: string;
}

export interface ProgrammeAssessment {
  eyebrow?: string;
  title?: string;
  body: string;
  items?: string[];
}

export type OptionState = "enroll" | "waitlist" | "unavailable";

export interface ProgrammeOption {
  key: string;
  name: string;
  bestFor: string;
  includes: string[];
  outcome: string;
  /** CTA label is always shown; href/state are rendered only when configured. */
  cta: { label: string; href?: string; state: OptionState };
  price?: { amount: number; currency: string; note?: string };
  schedule?: string;
  availability?: string;
  /** Optional upgrade path copy, shown on the card. */
  upgradeNote?: string;
}

export interface ProgrammeOptions {
  eyebrow?: string;
  title?: string;
  items: ProgrammeOption[];
}

export interface ProgrammeClosing {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  scopeLine?: string;
}

export interface CourseContent {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  /** One-line positioning. */
  tagline: string;
  /** Short course proposition. */
  description: string;
  heroCopy: string;
  learningOutcomes: string[];
  audience: string[];
  prerequisites: string[];
  partOne: CoursePartOne;
  partTwo: CoursePartTwo;
  caseRoom: CaseRoomExercise[];
  toolkit: ToolkitItem[];
  faculty: FacultyMember[];
  duration?: string;
  weeklyCommitment?: string;
  selfPacedStart?: string;
  liveStart?: string;
  liveEnd?: string;
  cohortSize?: number;
  certificateFoundation?: string;
  certificateComplete?: string;
  pricing: {
    foundation: PricingTier;
    complete: PricingTier;
  };
  faq: FaqItem[];
  disclaimer: string;
  cta: CourseCta;
  /** Cohort-based, application-first programmes (e.g. Counselling Internship). */
  applicationBased?: boolean;
  /** Featured in the January 2027 campaign. */
  campaign?: boolean;
  /** Display order within listings. */
  order?: number;

  /**
   * "brief" renders the rich programme layout (hero, overview, how it works,
   * audience, curriculum stages, materials, assessment, options, closing).
   * "default" renders the simpler layout. Defaults to "default".
   */
  layout?: "default" | "brief";
  hero?: ProgrammeHero;
  overview?: ProgrammeOverview;
  howItWorks?: { eyebrow?: string; title?: string; steps: ProgrammeStep[] };
  audienceGroups?: AudienceGroup[];
  curriculum?: ProgrammeCurriculum;
  materials?: ProgrammeMaterials;
  assessment?: ProgrammeAssessment;
  options?: ProgrammeOptions;
  closing?: ProgrammeClosing;
}

export interface CampaignCopy {
  headline: string;
  supporting: string;
  lines: string[];
  eyebrow: string;
}
