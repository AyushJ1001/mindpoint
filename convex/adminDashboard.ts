import { query } from "./_generated/server";
import { requireAdmin, normalizeEnrollmentStatus } from "./adminAuth";

export const getDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const COURSE_SCAN_LIMIT = 5000;
    const ENROLLMENT_SCAN_LIMIT = 5000;
    const COUPON_SCAN_LIMIT = 5000;

    const [
      draftCourses,
      publishedViaIndex,
      publishedLegacy,
      archivedCourses,
      enrollments,
      auditLogs,
      coupons,
    ] = await Promise.all([
      ctx.db
        .query("courses")
        .withIndex("by_lifecycleStatus", (q) =>
          q.eq("lifecycleStatus", "draft"),
        )
        .order("desc")
        .take(COURSE_SCAN_LIMIT),
      ctx.db
        .query("courses")
        .withIndex("by_lifecycleStatus", (q) =>
          q.eq("lifecycleStatus", "published"),
        )
        .order("desc")
        .take(COURSE_SCAN_LIMIT),
      ctx.db
        .query("courses")
        .filter((q) => q.eq(q.field("lifecycleStatus"), undefined))
        .order("desc")
        .take(500), // small bounded scan; unindexed legacy docs only
      ctx.db
        .query("courses")
        .withIndex("by_lifecycleStatus", (q) =>
          q.eq("lifecycleStatus", "archived"),
        )
        .order("desc")
        .take(COURSE_SCAN_LIMIT),
      ctx.db.query("enrollments").order("desc").take(ENROLLMENT_SCAN_LIMIT),
      ctx.db
        .query("adminAuditLogs")
        .withIndex("by_createdAt")
        .order("desc")
        .take(15),
      ctx.db.query("coupons").order("desc").take(COUPON_SCAN_LIMIT),
    ]);

    const publishedMap = new Map<string, (typeof publishedViaIndex)[number]>();
    for (const course of publishedViaIndex) {
      publishedMap.set(String(course._id), course);
    }
    for (const course of publishedLegacy) {
      if (!publishedMap.has(String(course._id))) {
        publishedMap.set(String(course._id), course);
      }
    }
    const publishedCourses = Array.from(publishedMap.values());

    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

    const lifecycleCounts = {
      draft: draftCourses.length,
      published: publishedCourses.length,
      archived: archivedCourses.length,
    };

    const statusCounts = {
      active: 0,
      cancelled: 0,
      transferred: 0,
    };

    for (const enrollment of enrollments) {
      statusCounts[normalizeEnrollmentStatus(enrollment.status)] += 1;
    }

    const urgentCourses = publishedCourses
      .map((course) => {
        const start = new Date(course.startDate).getTime();
        const seatsLeft = Math.max(
          0,
          (course.capacity ?? 0) - (course.enrolledUsers ?? []).length,
        );
        return {
          ...course,
          startTimestamp: Number.isNaN(start) ? 0 : start,
          seatsLeft,
        };
      })
      .filter(
        (course) =>
          course.startTimestamp > now &&
          course.startTimestamp < sevenDaysFromNow,
      )
      .sort((a, b) => a.startTimestamp - b.startTimestamp)
      .slice(0, 10);

    return {
      lifecycleCounts,
      statusCounts,
      totalUsersApprox: new Set(enrollments.map((row) => row.userId)).size,
      activeCoupons: coupons.filter((coupon) => !coupon.isUsed).length,
      urgentCourses,
      recentAuditLogs: auditLogs,
    };
  },
});
