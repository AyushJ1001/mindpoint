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

    // A screenshot with no verification flag is the shape of the incident: the
    // payment was never recorded as pending, so nothing ever blocked access.
    const screenshotUnflagged = active.filter(
      (row) =>
        Boolean(row.paymentScreenshotUrl) &&
        row.paymentVerification === undefined,
    );

    return {
      activeTotal: active.length,
      pendingVerification: pendingVerification.length,
      rejectedButActive: rejectedButActive.length,
      noVerificationField: noVerificationField.length,
      activeWithScreenshot: withScreenshot.length,
      pendingSample: pendingVerification.slice(0, 25).map((row) => ({
        enrollmentId: String(row._id),
        courseName: row.courseName ?? null,
        enrollmentNumber: row.enrollmentNumber,
        createdAt: row._creationTime,
        amountPaid: row.amountPaid ?? null,
        hasPaymentReference: Boolean(row.razorpayPaymentId),
        hasScreenshot: Boolean(row.paymentScreenshotUrl),
      })),
      rejectedSample: rejectedButActive
        .slice(0, 10)
        .map((row) => String(row._id)),
      screenshotUnflagged: screenshotUnflagged.map((row) => ({
        enrollmentId: String(row._id),
        courseId: String(row.courseId),
        courseName: row.courseName ?? null,
        enrollmentNumber: row.enrollmentNumber,
        createdAt: row._creationTime,
        status: row.status ?? "active",
        amountPaid: row.amountPaid ?? null,
        hasPaymentReference: Boolean(row.razorpayPaymentId),
        couponCode: row.couponCode ?? null,
        confirmationSentAt: row.lastConfirmationSentAt ?? null,
      })),
    };
  },
});
