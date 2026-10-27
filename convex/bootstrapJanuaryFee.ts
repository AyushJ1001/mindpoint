import { internalMutation } from "./_generated/server";

// January 2027 standard fee (owner decision, 27 October 2026).
//
// The three applied certificate portfolios are ₹4,500 for the eight-week
// course. Existing enrollments keep the price they paid; this only changes the
// catalogue price new buyers see. Promotional offers are cleared so the price
// shown is the price charged until an admin activates a campaign.
//
// Run once against a deployment:
//   npx convex run bootstrapJanuaryFee:applyJanuaryFee --prod
//
// Idempotent: rows are matched by code, archived duplicates are skipped, and
// the patch is a plain overwrite.

const JANUARY_FEE = 4500;
const ACTOR = "bootstrap:january-fee";

const JANUARY_CODES = ["CCCBT", "CCPD", "CCICH"];

export const applyJanuaryFee = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const patched: {
      courseId: string;
      code: string;
      name: string;
      price: number;
    }[] = [];

    for (const code of JANUARY_CODES) {
      const matches = courses.filter((course) => course.code === code);
      for (const course of matches) {
        if (course.lifecycleStatus === "archived") continue;
        await ctx.db.patch(course._id, {
          price: JANUARY_FEE,
          offer: undefined,
          bogo: undefined,
          updatedAt: now,
          updatedByAdminId: ACTOR,
        });
        patched.push({
          courseId: String(course._id),
          code,
          name: course.name,
          price: JANUARY_FEE,
        });
      }
    }

    return { price: JANUARY_FEE, patched };
  },
});
