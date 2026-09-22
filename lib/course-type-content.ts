import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

import {
  courseTypeContent,
  courseTypeFaqs,
  courseTypeProof,
  defaultOutcomes,
  defaultPainPoints,
  whoShouldDoByType,
  whyChooseByType,
  courseTypeClosing,
} from "@/lib/course-content-data";
import type { CourseTypeContentOverride } from "@/lib/site-content";

export interface CourseTypeContentBundle {
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  proof: string[];
  painPoints: string[];
  outcomes: string[];
  whoShouldDo: {
    title: string;
    description: string;
    items: { icon: string; title: string; description: string }[];
  };
  whyChoose: {
    title: string;
    description: string;
    items: { icon: LucideIcon; title: string; description: string }[];
  };
  faqs: { question: string; answer: string }[];
  closing: {
    headline: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
}

const FALLBACK_CLOSING = {
  headline: "Take the next step.",
  body: "Browse the courses below, or talk to us about where to start.",
  primaryLabel: "Browse courses",
  primaryHref: "#courses",
  secondaryLabel: "Talk to an advisor",
  secondaryHref: "/contact",
};

export function getDefaultCourseTypeContent(
  type: string,
): CourseTypeContentBundle {
  const info = courseTypeContent[type] ?? courseTypeContent.certificate;
  const who = whoShouldDoByType[type];
  const why = whyChooseByType[type];

  return {
    title: info.title,
    tagline: info.tagline,
    description: info.description,
    icon: info.icon,
    proof: courseTypeProof[type] ?? [],
    painPoints: defaultPainPoints[type] ?? [],
    outcomes: defaultOutcomes[type] ?? [],
    whoShouldDo: who
      ? { title: who.title, description: who.description, items: who.items }
      : { title: "Who is this for?", description: "", items: [] },
    whyChoose: why
      ? { title: why.title, description: why.description, items: why.items }
      : { title: "Why learn with us?", description: "", items: [] },
    faqs: courseTypeFaqs[type] ?? [],
    closing: courseTypeClosing[type] ?? FALLBACK_CLOSING,
  };
}

/**
 * Layer an admin-authored override over the code defaults. Empty arrays and
 * missing fields fall back to the defaults, so a partially-filled override
 * never blanks a section.
 */
export function resolveCourseTypeContent(
  type: string,
  override?: CourseTypeContentOverride | null,
): CourseTypeContentBundle {
  const base = getDefaultCourseTypeContent(type);
  if (!override) return base;

  const whyItems =
    override.whyChoose?.items && override.whyChoose.items.length > 0
      ? override.whyChoose.items.map((item, i) => ({
          icon: base.whyChoose.items[i]?.icon ?? Sparkles,
          title: item.title,
          description: item.description,
        }))
      : base.whyChoose.items;

  const whoItems =
    override.whoShouldDo?.items && override.whoShouldDo.items.length > 0
      ? override.whoShouldDo.items.map((item) => ({
          icon: item.icon ?? "",
          title: item.title,
          description: item.description,
        }))
      : base.whoShouldDo.items;

  return {
    ...base,
    title: override.title ?? base.title,
    tagline: override.tagline ?? base.tagline,
    description: override.description ?? base.description,
    proof: override.proof?.length ? override.proof : base.proof,
    painPoints: override.painPoints?.length
      ? override.painPoints
      : base.painPoints,
    outcomes: override.outcomes?.length ? override.outcomes : base.outcomes,
    whoShouldDo: {
      title: override.whoShouldDo?.title ?? base.whoShouldDo.title,
      description:
        override.whoShouldDo?.description ?? base.whoShouldDo.description,
      items: whoItems,
    },
    whyChoose: {
      title: override.whyChoose?.title ?? base.whyChoose.title,
      description:
        override.whyChoose?.description ?? base.whyChoose.description,
      items: whyItems,
    },
    faqs: override.faqs?.length ? override.faqs : base.faqs,
    closing: { ...base.closing, ...(override.closing ?? {}) },
  };
}
