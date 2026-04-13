const assert = require("node:assert/strict");

async function main() {
  const {
    allocateFlatFeeAcrossCourses,
    evaluateBundleCampaigns,
    isBundleCampaignActive,
    pickWinningBundleCampaign,
  } = await import("./packages/domain/src/bundles.ts");

  assert.equal(
    isBundleCampaignActive(
      {
        _id: "bundle-1",
        name: "April Workshops",
        flatFee: 7000,
        requiredCourseCountMin: 7,
        requiredCourseCountMax: 7,
        eligibleCourseIds: ["a"],
        priority: 100,
        enabled: true,
        isArchived: false,
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      },
      new Date("2026-04-15T00:00:00Z"),
    ),
    true,
  );
  assert.equal(
    isBundleCampaignActive(
      {
        _id: "bundle-2",
        name: "Future Bundle",
        flatFee: 5000,
        requiredCourseCountMin: 3,
        requiredCourseCountMax: 3,
        eligibleCourseIds: ["a"],
        priority: 100,
        enabled: true,
        isArchived: false,
        startDate: "2026-05-01",
      },
      new Date("2026-04-15T00:00:00Z"),
    ),
    false,
  );

  const exactBundle = {
    _id: "exact-7",
    _creationTime: 10,
    name: "7 Workshop Pass",
    flatFee: 7000,
    requiredCourseCountMin: 7,
    requiredCourseCountMax: 7,
    eligibleCourseIds: ["w1", "w2", "w3", "w4", "w5", "w6", "w7"],
    priority: 100,
    enabled: true,
    isArchived: false,
  };

  const exactResult = evaluateBundleCampaigns(
    [
      { courseId: "w1", listedPrice: 1200, quantity: 1 },
      { courseId: "w2", listedPrice: 1200, quantity: 1 },
      { courseId: "w3", listedPrice: 1200, quantity: 1 },
      { courseId: "w4", listedPrice: 1200, quantity: 1 },
      { courseId: "w5", listedPrice: 1200, quantity: 1 },
      { courseId: "w6", listedPrice: 1200, quantity: 1 },
      { courseId: "w7", listedPrice: 1200, quantity: 1 },
    ],
    [exactBundle],
    new Date("2026-04-15T00:00:00Z"),
  );
  assert.equal(exactResult.appliedCampaign?.campaignName, "7 Workshop Pass");
  assert.equal(exactResult.appliedCampaign?.coveredCourseIds.length, 7);
  assert.equal(exactResult.appliedCampaign?.coveredSavings, 1400);

  const overExactResult = evaluateBundleCampaigns(
    [
      { courseId: "w1", listedPrice: 1200, quantity: 2 },
      { courseId: "w2", listedPrice: 1200, quantity: 1 },
      { courseId: "w3", listedPrice: 1200, quantity: 1 },
      { courseId: "w4", listedPrice: 1200, quantity: 1 },
      { courseId: "w5", listedPrice: 1200, quantity: 1 },
      { courseId: "w6", listedPrice: 1200, quantity: 1 },
      { courseId: "w7", listedPrice: 1200, quantity: 1 },
      { courseId: "w8", listedPrice: 1200, quantity: 1 },
    ],
    [
      {
        _id: "range-3-5",
        _creationTime: 20,
        name: "5 Course Pick",
        flatFee: 4500,
        requiredCourseCountMin: 3,
        requiredCourseCountMax: 5,
        eligibleCourseIds: ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8"],
        priority: 90,
        enabled: true,
        isArchived: false,
      },
      {
        _id: "exact-7-wide-pool",
        _creationTime: 21,
        name: "Exact 7 From 8",
        flatFee: 6500,
        requiredCourseCountMin: 7,
        requiredCourseCountMax: 7,
        eligibleCourseIds: ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8"],
        priority: 110,
        enabled: true,
        isArchived: false,
      },
    ],
    new Date("2026-04-15T00:00:00Z"),
  );
  assert.equal(overExactResult.appliedCampaign, null);

  const overlapResult = evaluateBundleCampaigns(
    [
      { courseId: "c1", listedPrice: 1000, quantity: 1 },
      { courseId: "c2", listedPrice: 2000, quantity: 1 },
      { courseId: "c3", listedPrice: 3000, quantity: 1 },
    ],
    [
      {
        _id: "low-priority",
        _creationTime: 5,
        name: "Lower Priority",
        flatFee: 5000,
        requiredCourseCountMin: 3,
        requiredCourseCountMax: 3,
        eligibleCourseIds: ["c1", "c2", "c3"],
        priority: 100,
        enabled: true,
        isArchived: false,
      },
      {
        _id: "high-priority",
        _creationTime: 6,
        name: "Higher Priority",
        flatFee: 4500,
        requiredCourseCountMin: 3,
        requiredCourseCountMax: 3,
        eligibleCourseIds: ["c1", "c2", "c3"],
        priority: 200,
        enabled: true,
        isArchived: false,
      },
    ],
    new Date("2026-04-15T00:00:00Z"),
  );
  assert.equal(overlapResult.qualifyingCampaigns.length, 2);
  assert.equal(
    pickWinningBundleCampaign(overlapResult.qualifyingCampaigns)?.campaignName,
    "Higher Priority",
  );
  assert.equal(overlapResult.appliedCampaign?.campaignName, "Higher Priority");

  const progressResult = evaluateBundleCampaigns(
    [
      { courseId: "c1", listedPrice: 1000, quantity: 2 },
      { courseId: "c2", listedPrice: 1000, quantity: 1 },
    ],
    [
      {
        _id: "progress-bundle",
        _creationTime: 1,
        name: "3 Course Bundle",
        flatFee: 2500,
        requiredCourseCountMin: 3,
        requiredCourseCountMax: 3,
        eligibleCourseIds: ["c1", "c2", "c3"],
        priority: 100,
        enabled: true,
        isArchived: false,
      },
    ],
    new Date("2026-04-15T00:00:00Z"),
  );
  assert.equal(progressResult.appliedCampaign, null);
  assert.equal(progressResult.progressCampaign?.progress.selectedCount, 2);
  assert.equal(progressResult.progressCampaign?.progress.minCount, 3);

  const allocation = allocateFlatFeeAcrossCourses(
    [
      { courseId: "c1", listedPrice: 1000 },
      { courseId: "c2", listedPrice: 2000 },
      { courseId: "c3", listedPrice: 3000 },
    ],
    5000,
  );
  assert.equal(
    allocation.reduce((sum, item) => sum + item.amountPaid, 0),
    5000,
  );
  assert.deepEqual(
    allocation.map((item) => item.amountPaid),
    [833, 1667, 2500],
  );

  console.log("bundle campaign tests passed");
}

main().catch((error) => {
  console.error("bundle campaign tests failed");
  console.error(error);
  process.exit(1);
});
