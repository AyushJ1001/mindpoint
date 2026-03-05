import { query } from "./_generated/server";
import { requireAdmin, normalizeCourseLifecycleStatus, normalizeEnrollmentStatus } from "./adminAuth";

export const getDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [courses, enrollments, auditLogs, coupons] = await Promise.all([
      ctx.db.query("courses").collect(),
      ctx.db.query("enrollments").collect(),
      ctx.db.query("adminAuditLogs").withIndex("by_createdAt").order("desc").take(15),
      ctx.db.query("coupons").collect(),
    ]);

    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

    const lifecycleCounts = {
      draft: 0,
      published: 0,
      archived: 0,
    };

    for (const course of courses) {
      lifecycleCounts[normalizeCourseLifecycleStatus(course.lifecycleStatus)] += 1;
    }

    const statusCounts = {
      active: 0,
      cancelled: 0,
      transferred: 0,
    };

    for (const enrollment of enrollments) {
      statusCounts[normalizeEnrollmentStatus(enrollment.status)] += 1;
    }

    const urgentCourses = courses
      .filter((course) => normalizeCourseLifecycleStatus(course.lifecycleStatus) === "published")
      .map((course) => {
        const start = new Date(course.startDate).getTime();
        const seatsLeft = Math.max(0, (course.capacity ?? 0) - (course.enrolledUsers ?? []).length);
        return {
          ...course,
          startTimestamp: Number.isNaN(start) ? 0 : start,
          seatsLeft,
        };
      })
      .filter((course) => course.startTimestamp > now && course.startTimestamp < sevenDaysFromNow)
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
