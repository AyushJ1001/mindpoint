export type BundleCampaignLike = {
  _id: string;
  _creationTime?: number;
  name: string;
  description?: string;
  flatFee: number;
  requiredCourseCountMin: number;
  requiredCourseCountMax: number;
  eligibleCourseIds: string[];
  priority: number;
  enabled: boolean;
  isArchived?: boolean;
  startDate?: string;
  endDate?: string;
};

export type BundleCartItem = {
  courseId: string;
  listedPrice: number;
  quantity?: number;
};

export type BundleAllocation = {
  courseId: string;
  listedPrice: number;
  checkoutPrice: number;
  amountPaid: number;
  savings: number;
};

export type EvaluatedBundleCampaign = {
  campaignId: string;
  campaignName: string;
  flatFee: number;
  priority: number;
  coveredCourseIds: string[];
  coveredListedSubtotal: number;
  coveredSavings: number;
  progress: {
    selectedCount: number;
    minCount: number;
    maxCount: number;
  };
  allocations: BundleAllocation[];
};

export type BundleEvaluationResult = {
  qualifyingCampaigns: EvaluatedBundleCampaign[];
  appliedCampaign: EvaluatedBundleCampaign | null;
  progressCampaign: EvaluatedBundleCampaign | null;
};

function toTimestamp(value?: string): number | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function compareCampaignPrecedence(
  left: BundleCampaignLike,
  right: BundleCampaignLike,
): number {
  if (left.priority !== right.priority) {
    return right.priority - left.priority;
  }

  const leftCreationTime = left._creationTime ?? Number.MAX_SAFE_INTEGER;
  const rightCreationTime = right._creationTime ?? Number.MAX_SAFE_INTEGER;
  if (leftCreationTime !== rightCreationTime) {
    return leftCreationTime - rightCreationTime;
  }

  return String(left._id).localeCompare(String(right._id));
}

function compareEvaluatedPrecedence(
  left: EvaluatedBundleCampaign,
  right: EvaluatedBundleCampaign,
): number {
  if (left.priority !== right.priority) {
    return right.priority - left.priority;
  }

  return String(left.campaignId).localeCompare(String(right.campaignId));
}

export function isBundleCampaignActive(
  campaign: BundleCampaignLike,
  now: number | Date = Date.now(),
): boolean {
  if (!campaign.enabled || campaign.isArchived) {
    return false;
  }

  const nowTimestamp = now instanceof Date ? now.getTime() : now;
  const startTimestamp = toTimestamp(campaign.startDate);
  const endTimestamp = toTimestamp(campaign.endDate);

  if (startTimestamp !== null && nowTimestamp < startTimestamp) {
    return false;
  }

  if (endTimestamp !== null && nowTimestamp > endTimestamp) {
    return false;
  }

  return true;
}

export function allocateFlatFeeAcrossCourses(
  coveredItems: Array<{ courseId: string; listedPrice: number }>,
  flatFee: number,
): BundleAllocation[] {
  const normalizedFlatFee = Math.max(0, Math.round(flatFee));
  const normalizedItems = coveredItems
    .map((item) => ({
      courseId: String(item.courseId),
      listedPrice: Math.max(0, Math.round(item.listedPrice)),
    }))
    .sort((left, right) => left.courseId.localeCompare(right.courseId));

  if (normalizedItems.length === 0) {
    return [];
  }

  const totalListedPrice = normalizedItems.reduce(
    (sum, item) => sum + item.listedPrice,
    0,
  );
  const useEqualWeights = totalListedPrice <= 0;
  const denominator = useEqualWeights ? normalizedItems.length : totalListedPrice;
  const provisional = normalizedItems.map((item) => {
    const numerator = useEqualWeights ? 1 : item.listedPrice;
    const rawAmount = (normalizedFlatFee * numerator) / denominator;
    const baseAmount = Math.floor(rawAmount);

    return {
      ...item,
      baseAmount,
      remainder: rawAmount - baseAmount,
    };
  });

  let remaining = normalizedFlatFee - provisional.reduce((sum, item) => sum + item.baseAmount, 0);
  provisional.sort((left, right) => {
    if (left.remainder !== right.remainder) {
      return right.remainder - left.remainder;
    }

    return left.courseId.localeCompare(right.courseId);
  });

  for (let index = 0; index < provisional.length && remaining > 0; index += 1) {
    provisional[index]!.baseAmount += 1;
    remaining -= 1;
  }

  return provisional
    .sort((left, right) => left.courseId.localeCompare(right.courseId))
    .map((item) => ({
      courseId: item.courseId,
      listedPrice: item.listedPrice,
      checkoutPrice: item.listedPrice,
      amountPaid: item.baseAmount,
      savings: Math.max(0, item.listedPrice - item.baseAmount),
    }));
}

export function pickWinningBundleCampaign(
  qualifyingCampaigns: EvaluatedBundleCampaign[],
): EvaluatedBundleCampaign | null {
  if (qualifyingCampaigns.length === 0) {
    return null;
  }

  return [...qualifyingCampaigns].sort(compareEvaluatedPrecedence)[0] ?? null;
}

export function evaluateBundleCampaigns(
  cartItems: BundleCartItem[],
  campaigns: BundleCampaignLike[],
  now: number | Date = Date.now(),
): BundleEvaluationResult {
  const distinctItems = new Map<string, { courseId: string; listedPrice: number }>();

  for (const item of cartItems) {
    const quantity = Math.max(0, Math.floor(item.quantity ?? 1));
    if (quantity <= 0) {
      continue;
    }

    const courseId = String(item.courseId);
    if (!distinctItems.has(courseId)) {
      distinctItems.set(courseId, {
        courseId,
        listedPrice: Math.max(0, Math.round(item.listedPrice)),
      });
    }
  }

  const activeCampaigns = campaigns
    .filter((campaign) => isBundleCampaignActive(campaign, now))
    .sort(compareCampaignPrecedence);

  const evaluated = activeCampaigns.map((campaign) => {
    const eligibleIdSet = new Set(campaign.eligibleCourseIds.map((courseId) => String(courseId)));
    const coveredItems = Array.from(distinctItems.values()).filter((item) =>
      eligibleIdSet.has(item.courseId),
    );
    const coveredCourseIds = coveredItems.map((item) => item.courseId);
    const coveredListedSubtotal = coveredItems.reduce(
      (sum, item) => sum + item.listedPrice,
      0,
    );
    const progress = {
      selectedCount: coveredCourseIds.length,
      minCount: Math.max(0, Math.round(campaign.requiredCourseCountMin)),
      maxCount: Math.max(0, Math.round(campaign.requiredCourseCountMax)),
    };
    const qualifies =
      progress.selectedCount >= progress.minCount &&
      progress.selectedCount <= progress.maxCount;
    const allocations = qualifies
      ? allocateFlatFeeAcrossCourses(coveredItems, campaign.flatFee)
      : [];
    const coveredSavings = qualifies
      ? Math.max(0, coveredListedSubtotal - Math.max(0, Math.round(campaign.flatFee)))
      : 0;

    return {
      campaignId: String(campaign._id),
      campaignName: campaign.name,
      flatFee: Math.max(0, Math.round(campaign.flatFee)),
      priority: Math.round(campaign.priority),
      coveredCourseIds,
      coveredListedSubtotal,
      coveredSavings,
      progress,
      allocations,
      qualifies,
    };
  });

  const qualifyingCampaigns = evaluated
    .filter((campaign) => campaign.qualifies)
    .map(({ qualifies: _qualifies, ...campaign }) => campaign);

  const appliedCampaign = pickWinningBundleCampaign(qualifyingCampaigns);
  const progressCampaign =
    appliedCampaign ??
    evaluated
      .filter(
        (campaign) =>
          !campaign.qualifies &&
          campaign.progress.selectedCount > 0 &&
          campaign.progress.selectedCount < campaign.progress.minCount,
      )
      .map(({ qualifies: _qualifies, ...campaign }) => campaign)
      .sort(compareEvaluatedPrecedence)[0] ??
    null;

  return {
    qualifyingCampaigns,
    appliedCampaign,
    progressCampaign,
  };
}
