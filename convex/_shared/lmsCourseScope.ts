export type LmsLearningMode = "self_paced" | "hybrid" | "cohort" | "event";

const learningModeByCourseType: Record<string, LmsLearningMode | undefined> = {
  "pre-recorded": "self_paced",
  certificate: "hybrid",
  diploma: "cohort",
  internship: "cohort",
  masterclass: "event",
};

export function getLmsLearningMode(courseType?: string) {
  return courseType ? learningModeByCourseType[courseType] : undefined;
}

export function isLmsCourseType(courseType?: string) {
  return getLmsLearningMode(courseType) !== undefined;
}

export function getLmsLearningModeLabel(mode: LmsLearningMode) {
  switch (mode) {
    case "self_paced":
      return "Self-paced learning";
    case "hybrid":
      return "Live + self-paced learning";
    case "cohort":
      return "Cohort learning";
    case "event":
      return "Live learning event";
  }
}
