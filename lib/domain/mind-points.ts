export type MindPointsCourseInput = {
  type?: string;
  duration?: string;
};

// Points earned per course type
export const POINTS_EARN_CONFIG = {
  certificate: 120,
  diploma: 200,
  internship: 80,
  worksheet: 20,
  masterclass: 20,
  "pre-recorded": 100,
} as const;

// Points required for redemption
export const POINTS_REDEEM_CONFIG = {
  worksheet: 80,
  certificate: 300,
  diploma: 500,
  internship: 200,
  masterclass: 100,
  "pre-recorded": 250,
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

export function getPointsRequiredForRedemption(
  courseType: string,
  _internshipPlan?: "120" | "240",
): number {
  if (courseType === "internship_120" || courseType === "internship_240") {
    return POINTS_REDEEM_CONFIG.internship;
  }

  if (courseType === "internship") {
    // _internshipPlan is kept for backwards API compatibility; all internships now share one redemption cost.
    return POINTS_REDEEM_CONFIG.internship;
  }

  const typeMap: Record<string, keyof typeof POINTS_REDEEM_CONFIG> = {
    certificate: "certificate",
    diploma: "diploma",
    worksheet: "worksheet",
    masterclass: "masterclass",
    "pre-recorded": "pre-recorded",
  };

  const configKey = typeMap[courseType];
  if (!configKey) return 0;

  return POINTS_REDEEM_CONFIG[configKey];
}

export function getRedemptionOptions(): Array<{
  courseType: string;
  pointsRequired: number;
  label: string;
}> {
  return [
    {
      courseType: "worksheet",
      pointsRequired: POINTS_REDEEM_CONFIG.worksheet,
      label: "Free Worksheet",
    },
    {
      courseType: "certificate",
      pointsRequired: POINTS_REDEEM_CONFIG.certificate,
      label: "Free Certificate Course",
    },
    {
      courseType: "diploma",
      pointsRequired: POINTS_REDEEM_CONFIG.diploma,
      label: "Free Diploma",
    },
    {
      courseType: "internship",
      pointsRequired: POINTS_REDEEM_CONFIG.internship,
      label: "Free Internship",
    },
    {
      courseType: "masterclass",
      pointsRequired: POINTS_REDEEM_CONFIG.masterclass,
      label: "Free Workshop",
    },
    {
      courseType: "pre-recorded",
      pointsRequired: POINTS_REDEEM_CONFIG["pre-recorded"],
      label: "Free Prerecorded Course",
    },
  ];
}
