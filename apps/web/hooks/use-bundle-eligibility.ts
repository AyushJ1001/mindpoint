"use client";

import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { useMemo } from "react";
import { showRupees } from "@/lib/utils";

export type BundleEligibility = {
  campaignName: string;
  flatFee: number;
  requiredCourseCountMin: number;
  requiredCourseCountMax: number;
  /** Human-readable summary, e.g. "3 courses for ₹7,000" */
  dealSummary: string;
};

/**
 * Returns bundle deal information for a given course ID if it belongs to any
 * active bundle campaign.  Returns the highest-priority matching campaign.
 *
 * The underlying Convex query is cached — multiple cards on the same page
 * share a single subscription.
 */
export function useBundleEligibility(
  courseId: string,
): BundleEligibility | null {
  const campaigns = useQuery(
    api.bundleCampaigns.listAllActiveBundleCampaigns,
    {},
  );

  return useMemo(() => {
    if (!campaigns || campaigns.length === 0) return null;

    // Campaigns are returned sorted by priority desc from the query.
    // Find the first (highest priority) campaign that includes this course.
    const match = campaigns.find((c) =>
      c.eligibleCourseIds.some((id) => String(id) === String(courseId)),
    );

    if (!match) return null;

    const { requiredCourseCountMin: min, requiredCourseCountMax: max } = match;
    const countLabel =
      min === max ? `${min}` : `${min}\u2013${max}`;

    return {
      campaignName: match.name,
      flatFee: match.flatFee,
      requiredCourseCountMin: min,
      requiredCourseCountMax: max,
      dealSummary: `${countLabel} courses for ${showRupees(match.flatFee)}`,
    };
  }, [campaigns, courseId]);
}
