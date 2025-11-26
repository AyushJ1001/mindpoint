import type { Doc } from "@/convex/_generated/dataModel";

// Points earned per course type
export const POINTS_EARN_CONFIG = {
  certificate: 120,
  diploma: 200,
  internship_120: 60,
  internship_240: 80,
  worksheet: 20,
  masterclass: 20, // Workshop
  "pre-recorded": 100,
} as const;

// Points required for redemption
export const POINTS_REDEEM_CONFIG = {
  worksheet: 80,
  certificate: 300,
  diploma: 500,
  internship_120: 120,
  internship_240: 200,
  masterclass: 100, // Workshop
  "pre-recorded": 250,
} as const;

/**
 * Calculate points earned for a course based on its type
 */
export function calculatePointsEarned(course: Doc<"courses">): number {
  if (!course.type) return 0;

  // Handle internship courses based on duration
  if (course.type === "internship") {
    const duration = course.duration?.toLowerCase() || "";
    if (duration.includes("120") || duration.includes("2 week")) {
      return POINTS_EARN_CONFIG.internship_120;
    }
    if (duration.includes("240") || duration.includes("4 week")) {
      return POINTS_EARN_CONFIG.internship_240;
    }
    // Default to 120hr if unclear
    return POINTS_EARN_CONFIG.internship_120;
  }

  // Map course type to points config key
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

/**
 * Get points required for redemption by course type
 */
export function getPointsRequiredForRedemption(
  courseType: string,
  internshipPlan?: "120" | "240",
): number {
  // Handle direct internship_120/internship_240 courseType matches
  if (courseType === "internship_120") {
    return POINTS_REDEEM_CONFIG.internship_120;
  }
  if (courseType === "internship_240") {
    return POINTS_REDEEM_CONFIG.internship_240;
  }

  // Handle "internship" courseType with plan parameter
  if (courseType === "internship") {
    if (internshipPlan === "120") {
      return POINTS_REDEEM_CONFIG.internship_120;
    }
    if (internshipPlan === "240") {
      return POINTS_REDEEM_CONFIG.internship_240;
    }
    // Default to 120hr
    return POINTS_REDEEM_CONFIG.internship_120;
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

/**
 * Get all available redemption options
 */
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
      courseType: "internship_120",
      pointsRequired: POINTS_REDEEM_CONFIG.internship_120,
      label: "Free 120hr Internship",
    },
    {
      courseType: "internship_240",
      pointsRequired: POINTS_REDEEM_CONFIG.internship_240,
      label: "Free 240hr Internship",
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
