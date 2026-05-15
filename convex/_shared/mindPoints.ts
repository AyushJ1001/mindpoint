export type MindPointsCourseInput = {
  type?: string;
  duration?: string;
};

const POINTS_EARN_CONFIG = {
  certificate: 120,
  diploma: 200,
  internship: 80,
  worksheet: 20,
  masterclass: 20,
  "pre-recorded": 100,
} as const;

export function calculatePointsEarned(course: MindPointsCourseInput): number {
  if (!course.type) return 0;

  if (course.type === "internship") {
    return POINTS_EARN_CONFIG.internship;
  }

  const typeMap: Record<string, keyof typeof POINTS_EARN_CONFIG> = {
    certificate: "certificate",
    diploma: "diploma",
    worksheet: "worksheet",
    masterclass: "masterclass",
    "pre-recorded": "pre-recorded",
  };

  const configKey = typeMap[course.type];
  if (!configKey) return 0;

  return POINTS_EARN_CONFIG[configKey];
}
