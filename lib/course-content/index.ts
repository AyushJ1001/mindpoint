import { courses } from "@/lib/course-content/courses";
import type { CourseContent } from "@/lib/course-content/types";

export * from "@/lib/course-content/types";
export { januaryCampaign, learningModel } from "@/lib/course-content/campaign";
export type { LearningStage } from "@/lib/course-content/campaign";
export { courses } from "@/lib/course-content/courses";

export function getCourseBySlug(slug: string): CourseContent | undefined {
  return courses.find((course) => course.slug === slug);
}

export function getCampaignCourses(): CourseContent[] {
  return courses
    .filter((course) => course.campaign)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function courseSlugs(): string[] {
  return courses.map((course) => course.slug);
}

/**
 * Maps an applied catalogue course code to its rich programme page. Used to
 * send browsing traffic from the legacy `/courses/<id>` detail view to the new
 * `/programs/<slug>` page (checkout still opens the catalogue page directly).
 */
const PROGRAMME_BY_CODE: Record<string, string> = {
  CCCBT: "cbt-rebt-cbmt",
  CCICH: "inner-child-healing",
  CCPD: "personality-disorders",
  INCLP: "counselling-internship",
};

export function programmeSlugForCode(code?: string | null): string | undefined {
  if (!code) return undefined;
  return PROGRAMME_BY_CODE[code];
}
