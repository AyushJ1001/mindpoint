import { internalMutation } from "./_generated/server";

// Diwali 2026: flat ₹1,000 off the five active programs, ending 15 Nov 2026
// 23:59 IST. The reconciler writes the offer onto each course, so the site, cart
// and checkout all read the same price. Archiving the campaign restores the
// standard fee.
//   npx convex run bootstrapDiwali2026:activate --prod
const ACTOR = "bootstrap:diwali-2026";
const CODE = "DIWALI-2026";
const ENDS_AT = "2026-11-15T18:29:59.000Z"; // 23:59:59 IST
const CODES = ["CCCBT", "CCPD", "CCICH", "CCPTSD", "INCLP"];

export const activate = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const eligible = courses.filter(
      (course) =>
        CODES.includes(course.code) &&
        course.lifecycleStatus === "published" &&
        course.salesEnabled !== false,
    );
    if (eligible.length === 0) return { error: "no eligible courses" };

    const existing = (await ctx.db.query("offerCampaigns").take(200)).find(
      (campaign) => campaign.name === CODE,
    );

    const fields = {
      name: CODE,
      description: "Diwali 2026 — flat ₹1,000 off the five active programs.",
      occasion: "diwali" as const,
      enabled: true,
      priority: 10,
      startDate: new Date(now - 60_000).toISOString(),
      endDate: ENDS_AT,
      eligibleCourseIds: eligible.map((course) => course._id),
      isArchived: false,
      offer: { name: "Diwali 2026", discountType: "flatOff" as const, discountValue: 1000 },
      updatedAt: now,
      updatedByAdminId: ACTOR,
    };

    const campaignId = existing
      ? (await ctx.db.patch(existing._id, fields), existing._id)
      : await ctx.db.insert("offerCampaigns", {
          ...fields,
          createdAt: now,
          createdByAdminId: ACTOR,
        });

    return {
      campaignId: String(campaignId),
      courses: eligible.map((course) => ({ code: course.code, price: course.price })),
      endsAt: ENDS_AT,
    };
  },
});
