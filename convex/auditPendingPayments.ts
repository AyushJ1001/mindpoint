import { internalQuery } from "./_generated/server";

/**
 * Read-only incident audit: which live enrollments do not have a verified
 * payment, and which look like screenshot payments that were never approved.
 * Returns aggregates and ids only — no names, emails or phone numbers.
 */
export const audit = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("enrollments").take(5000);
    const active = rows.filter((row) => (row.status ?? "active") === "active");

    const pendingVerification = active.filter(
      (row) => row.paymentVerification === "pending",
    );
    const rejectedButActive = active.filter(
      (row) => row.paymentVerification === "rejected",
    );
    const noVerificationField = active.filter(
      (row) => row.paymentVerification === undefined,
    );
    const withScreenshot = active.filter((row) =>
      Boolean(row.paymentScreenshotUrl),
    );

    return {
      activeTotal: active.length,
      pendingVerification: pendingVerification.length,
      rejectedButActive: rejectedButActive.length,
      noVerificationField: noVerificationField.length,
      activeWithScreenshot: withScreenshot.length,
      pendingSample: pendingVerification.slice(0, 25).map((row) => String(row._id)),
      rejectedSample: rejectedButActive.slice(0, 10).map((row) => String(row._id)),
    };
  },
});
