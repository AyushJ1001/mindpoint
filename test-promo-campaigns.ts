import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildOfferFromCampaign,
  isCampaignActive,
  offerMatches,
  pickCampaignForCourse,
  planReconciliation,
  priceWithDiscount,
  type CampaignRule,
} from "./lib/domain/promo-campaigns";

const NOW = Date.parse("2026-11-05T10:00:00.000Z");

function campaign(overrides: Partial<CampaignRule> & { _id: string }): CampaignRule {
  return {
    name: "Campaign",
    createdAt: 1,
    offer: { discountType: "percentage", discountValue: 10 },
    ...overrides,
  };
}

const course = (
  overrides: Partial<{
    _id: string;
    price: number;
    offer: import("./lib/domain/promo-campaigns").CampaignCourse["offer"];
  }> = {},
) => ({
  _id: "course-1",
  price: 4500,
  ...overrides,
});

test("percentage discount produces the standard fee minus the percentage", () => {
  assert.equal(priceWithDiscount(4500, { type: "percentage", value: 10 }), 4050);
  assert.equal(priceWithDiscount(4500, { type: "flatOff", value: 500 }), 4000);
  assert.equal(priceWithDiscount(4500, { type: "fixedPrice", value: 3999 }), 3999);
});

test("a discount never produces a negative price", () => {
  assert.equal(priceWithDiscount(4500, { type: "flatOff", value: 9000 }), 0);
  assert.equal(priceWithDiscount(4500, { type: "percentage", value: 100 }), 0);
});

test("a general campaign carries no campaign name", () => {
  const offer = buildOfferFromCampaign(
    course(),
    campaign({
      _id: "c1",
      occasion: "general",
      name: "Internal November Push",
      offer: { discountType: "flatOff", discountValue: 500 },
    }),
    { type: "flatOff", value: 500 },
  );
  assert.equal(offer.name, "");
  assert.equal(offer.occasion, "general");
  assert.equal(offer.standardPrice, 4500);
  assert.equal(offer.offerPrice, 4000);
});

test("a seasonal campaign keeps its occasion and dates", () => {
  const offer = buildOfferFromCampaign(
    course(),
    campaign({
      _id: "c2",
      occasion: "diwali",
      name: "Diwali 2026",
      startDate: "2026-11-01T00:00:00.000Z",
      endDate: "2026-11-15T00:00:00.000Z",
    }),
    { type: "percentage", value: 10 },
  );
  assert.equal(offer.occasion, "diwali");
  assert.equal(offer.name, "Diwali 2026");
  assert.equal(offer.startDate, "2026-11-01T00:00:00.000Z");
});

test("campaigns outside their window are inactive", () => {
  const ended = campaign({
    _id: "c3",
    endDate: "2026-11-01T00:00:00.000Z",
    eligibleCourseIds: ["course-1"],
  });
  const future = campaign({
    _id: "c4",
    startDate: "2026-12-01T00:00:00.000Z",
    eligibleCourseIds: ["course-1"],
  });
  assert.equal(isCampaignActive(ended, NOW), false);
  assert.equal(isCampaignActive(future, NOW), false);
});

test("a disabled or course-less campaign never applies", () => {
  const disabled = campaign({
    _id: "c5",
    enabled: false,
    eligibleCourseIds: ["course-1"],
  });
  const unassigned = campaign({ _id: "c6", eligibleCourseIds: [] });
  assert.equal(isCampaignActive(disabled, NOW), false);
  assert.equal(isCampaignActive(unassigned, NOW), false);
  assert.equal(pickCampaignForCourse(course(), [disabled, unassigned], NOW), null);
});

test("only one campaign wins, so offers cannot stack", () => {
  const winner = pickCampaignForCourse(
    course(),
    [
      campaign({
        _id: "small",
        priority: 0,
        eligibleCourseIds: ["course-1"],
        offer: { discountType: "flatOff", discountValue: 100 },
      }),
      campaign({
        _id: "large",
        priority: 0,
        eligibleCourseIds: ["course-1"],
        offer: { discountType: "flatOff", discountValue: 900 },
      }),
    ],
    NOW,
  );
  assert.equal(winner?.campaign._id, "large");
});

test("priority beats a bigger saving", () => {
  const winner = pickCampaignForCourse(
    course(),
    [
      campaign({
        _id: "priority",
        priority: 5,
        eligibleCourseIds: ["course-1"],
        offer: { discountType: "flatOff", discountValue: 100 },
      }),
      campaign({
        _id: "bigger",
        priority: 1,
        eligibleCourseIds: ["course-1"],
        offer: { discountType: "flatOff", discountValue: 900 },
      }),
    ],
    NOW,
  );
  assert.equal(winner?.campaign._id, "priority");
});

test("equal priority and saving resolves to the older campaign", () => {
  const winner = pickCampaignForCourse(
    course(),
    [
      campaign({ _id: "newer", createdAt: 20, eligibleCourseIds: ["course-1"] }),
      campaign({ _id: "older", createdAt: 10, eligibleCourseIds: ["course-1"] }),
    ],
    NOW,
  );
  assert.equal(winner?.campaign._id, "older");
});

test("reconciliation applies the winner and clears only campaign offers", () => {
  const campaigns = [
    campaign({
      _id: "live",
      createdAt: 1,
      eligibleCourseIds: ["course-1"],
      offer: { discountType: "flatOff", discountValue: 500 },
    }),
  ];

  const plan = planReconciliation(
    [
      course({ _id: "course-1" }),
      course({
        _id: "course-2",
        offer: {
          name: "Hand-made offer",
          discountType: "flatOff",
          discountValue: 200,
        },
      }),
      course({
        _id: "course-3",
        offer: {
          name: "Expired campaign",
          campaignId: "gone",
          discountType: "flatOff",
          discountValue: 300,
        },
      }),
    ],
    campaigns,
    NOW,
  );

  assert.deepEqual(
    plan.apply.map((item) => item.courseId),
    ["course-1"],
  );
  assert.equal(plan.apply[0].offer.offerPrice, 4000);
  // A hand-applied offer is not ours to clear; a stale campaign offer is.
  assert.deepEqual(plan.clear, ["course-3"]);
});

test("an offer that already matches is not rewritten", () => {
  const campaigns = [
    campaign({
      _id: "live",
      eligibleCourseIds: ["course-1"],
      offer: { discountType: "flatOff", discountValue: 500 },
    }),
  ];
  const winner = pickCampaignForCourse(course(), campaigns, NOW);
  assert.ok(winner);
  const offer = buildOfferFromCampaign(course(), winner.campaign, winner.discount);
  const plan = planReconciliation(
    [course({ _id: "course-1", offer: { ...offer } })],
    campaigns,
    NOW,
  );
  assert.equal(plan.apply.length, 0);
  assert.equal(plan.clear.length, 0);
  assert.equal(offerMatches(course({ offer }), offer), true);
});
