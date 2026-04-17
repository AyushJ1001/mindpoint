import { query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { normalizeEnrollmentStatus } from "./adminUtils";

export const getDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const COURSE_SCAN_LIMIT = 1000;
    const ENROLLMENT_SCAN_LIMIT = 1000;
    const COUPON_SCAN_LIMIT = 1000;

    const [
      draftCourses,
      publishedViaIndex,
      publishedLegacy,
      archivedCourses,
      activeEnrollments,
      activeLegacyEnrollments,
      cancelledEnrollments,
      transferredEnrollments,
      auditLogs,
      activeCoupons,
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
      ctx.db
        .query("enrollments")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .order("desc")
        .take(ENROLLMENT_SCAN_LIMIT),
      ctx.db
        .query("enrollments")
        .filter((q) => q.eq(q.field("status"), undefined))
        .order("desc")
        .take(500),
      ctx.db
        .query("enrollments")
        .withIndex("by_status", (q) => q.eq("status", "cancelled"))
        .order("desc")
        .take(ENROLLMENT_SCAN_LIMIT),
      ctx.db
        .query("enrollments")
        .withIndex("by_status", (q) => q.eq("status", "transferred"))
        .order("desc")
        .take(ENROLLMENT_SCAN_LIMIT),
      ctx.db
        .query("adminAuditLogs")
        .withIndex("by_createdAt")
        .order("desc")
        .take(15),
      ctx.db
        .query("coupons")
        .withIndex("by_isUsed", (q) => q.eq("isUsed", false))
        .order("desc")
        .take(COUPON_SCAN_LIMIT),
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

    const activeMap = new Map<string, (typeof activeEnrollments)[number]>();
    for (const enrollment of activeEnrollments) {
      activeMap.set(String(enrollment._id), enrollment);
    }
    for (const enrollment of activeLegacyEnrollments) {
      if (!activeMap.has(String(enrollment._id))) {
        activeMap.set(String(enrollment._id), enrollment);
      }
    }
    const mergedActiveEnrollments = Array.from(activeMap.values());
    const allEnrollmentRows = [
      ...mergedActiveEnrollments,
      ...cancelledEnrollments,
      ...transferredEnrollments,
    ];

    const statusCounts = {
      active: mergedActiveEnrollments.length,
      cancelled: cancelledEnrollments.length,
      transferred: transferredEnrollments.length,
    };

    const urgentCourses = publishedCourses
      .map((course) => {
        const start = course.startDate
          ? new Date(course.startDate).getTime()
          : Number.NaN;
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
      totalUsersApprox: new Set(allEnrollmentRows.map((row) => row.userId))
        .size,
      activeCoupons: activeCoupons.length,
      urgentCourses,
      recentAuditLogs: auditLogs,
    };
  },
});
