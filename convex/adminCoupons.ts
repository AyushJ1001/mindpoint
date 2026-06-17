import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAdmin } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";
import {
  AdminCouponDiscountValue,
  AdminCouponRequirementValue,
  AdminCouponSelectorValue,
} from "./schema";
import {
  convexFailure,
  convexResultErrorCode,
  convexSuccess,
  type ConvexFailure,
} from "./_shared/result";

const MAX_COUPON_COURSES = 500;

const adminCouponPayload = {
  code: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  enabled: v.boolean(),
  discount: AdminCouponDiscountValue,
  appliesTo: AdminCouponSelectorValue,
  requires: AdminCouponRequirementValue,
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  redemptionLimit: v.optional(v.number()),
};

type AdminCouponInput = {
  code: string;
  name: string;
  description?: string;
  enabled: boolean;
  discount: Doc<"adminCoupons">["discount"];
  appliesTo: Doc<"adminCoupons">["appliesTo"];
  requires: Doc<"adminCoupons">["requires"];
  startDate?: string;
  endDate?: string;
  redemptionLimit?: number;
};

type AdminCouponFailure = ConvexFailure<
  "CONFLICT" | "INVALID_COUPON_CODE" | "NOT_FOUND" | "VALIDATION_ERROR"
>;

function adminCouponFailure(
  message: string,
  code:
    | "CONFLICT"
    | "INVALID_COUPON_CODE"
    | "NOT_FOUND"
    | "VALIDATION_ERROR" = convexResultErrorCode.VALIDATION_ERROR,
): AdminCouponFailure {
  return convexFailure({ code, message });
}

function normalizeString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizeCouponCode(value: string) {
  return value.trim().toUpperCase();
}

function validateDateWindow(startDate?: string, endDate?: string) {
  const startTimestamp = startDate ? new Date(startDate).getTime() : null;
  const endTimestamp = endDate ? new Date(endDate).getTime() : null;

  if (startTimestamp !== null && Number.isNaN(startTimestamp)) {
    return adminCouponFailure("Start date is invalid");
  }
  if (endTimestamp !== null && Number.isNaN(endTimestamp)) {
    return adminCouponFailure("End date is invalid");
  }
  if (
    startTimestamp !== null &&
    endTimestamp !== null &&
    startTimestamp > endTimestamp
  ) {
    return adminCouponFailure("End date must be on or after the start date");
  }

  return null;
}

function uniqueCourseIds(courseIds: Id<"courses">[]) {
  return Array.from(new Set(courseIds.map((courseId) => String(courseId)))).map(
    (courseId) => courseId as Id<"courses">,
  );
}

function normalizeSelector(
  selector: Doc<"adminCoupons">["appliesTo"],
): AdminCouponFailure | Doc<"adminCoupons">["appliesTo"] {
  if (selector.type === "cart") {
    return selector;
  }

  if (selector.type === "courses") {
    const courseIds = uniqueCourseIds(selector.courseIds);
    if (courseIds.length === 0) {
      return adminCouponFailure("Select at least one coupon target course");
    }
    if (courseIds.length > MAX_COUPON_COURSES) {
      return adminCouponFailure(
        `Cannot target more than ${MAX_COUPON_COURSES} courses in one coupon`,
      );
    }
    return { type: "courses", courseIds };
  }

  const courseTypes = Array.from(new Set(selector.courseTypes));
  if (courseTypes.length === 0) {
    return adminCouponFailure("Select at least one coupon target course type");
  }
  return { type: "courseTypes", courseTypes };
}

function normalizeRequirement(
  requirement: Doc<"adminCoupons">["requires"],
): AdminCouponFailure | Doc<"adminCoupons">["requires"] {
  if (requirement.type === "none") {
    return requirement;
  }

  if (requirement.type === "courses") {
    const courseIds = uniqueCourseIds(requirement.courseIds);
    if (courseIds.length === 0) {
      return adminCouponFailure("Select at least one required course");
    }
    if (courseIds.length > MAX_COUPON_COURSES) {
      return adminCouponFailure(
        `Cannot require more than ${MAX_COUPON_COURSES} courses in one coupon`,
      );
    }
    return { type: "courses", courseIds };
  }

  const courseTypes = Array.from(new Set(requirement.courseTypes));
  if (courseTypes.length === 0) {
    return adminCouponFailure("Select at least one required course type");
  }
  return { type: "courseTypes", courseTypes };
}

function normalizeCoupon(
  input: AdminCouponInput,
): AdminCouponFailure | AdminCouponInput {
  const code = normalizeCouponCode(input.code);
  if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(code)) {
    return adminCouponFailure(
      "Coupon code must be 3-40 characters using letters, numbers, dashes, or underscores",
      convexResultErrorCode.INVALID_COUPON_CODE,
    );
  }

  const name = normalizeString(input.name);
  if (!name) {
    return adminCouponFailure("Coupon name is required");
  }

  if (input.discount.type === "percentage") {
    if (
      !Number.isFinite(input.discount.value) ||
      input.discount.value <= 0 ||
      input.discount.value > 100
    ) {
      return adminCouponFailure(
        "Percentage discount must be between 1 and 100",
      );
    }
    if (
      input.discount.maxDiscount !== undefined &&
      (!Number.isFinite(input.discount.maxDiscount) ||
        input.discount.maxDiscount <= 0)
    ) {
      return adminCouponFailure("Maximum discount must be greater than 0");
    }
  }

  if (
    input.discount.type === "flat" &&
    (!Number.isFinite(input.discount.value) || input.discount.value <= 0)
  ) {
    return adminCouponFailure("Flat discount must be greater than 0");
  }

  const appliesTo = normalizeSelector(input.appliesTo);
  if ("_tag" in appliesTo) {
    return appliesTo;
  }

  const requires = normalizeRequirement(input.requires);
  if ("_tag" in requires) {
    return requires;
  }

  const dateFailure = validateDateWindow(input.startDate, input.endDate);
  if (dateFailure) {
    return dateFailure;
  }

  const redemptionLimit =
    input.redemptionLimit === undefined ? undefined : input.redemptionLimit;
  if (
    redemptionLimit !== undefined &&
    (!Number.isInteger(redemptionLimit) || redemptionLimit <= 0)
  ) {
    return adminCouponFailure("Redemption limit must be a positive integer");
  }

  return {
    code,
    name,
    description: normalizeString(input.description),
    enabled: input.enabled,
    discount: input.discount,
    appliesTo,
    requires,
    startDate: input.startDate || undefined,
    endDate: input.endDate || undefined,
    redemptionLimit,
  };
}

function isCouponActive(coupon: Doc<"adminCoupons">, now: number) {
  const start = coupon.startDate ? new Date(coupon.startDate).getTime() : null;
  const end = coupon.endDate ? new Date(coupon.endDate).getTime() : null;
  const limit = coupon.redemptionLimit;

  return (
    coupon.enabled &&
    !coupon.isArchived &&
    (start === null || Number.isNaN(start) || now >= start) &&
    (end === null || Number.isNaN(end) || now <= end) &&
    (limit === undefined || limit <= 0 || coupon.totalRedemptions < limit)
  );
}

function couponCourseIds(coupon: AdminCouponInput) {
  return [
    ...(coupon.appliesTo.type === "courses" ? coupon.appliesTo.courseIds : []),
    ...(coupon.requires.type === "courses" ? coupon.requires.courseIds : []),
  ];
}

async function validateCouponCoursesExist(
  ctx: MutationCtx,
  coupon: AdminCouponInput,
) {
  const courseIds = uniqueCourseIds(couponCourseIds(coupon));
  const courses = await Promise.all(
    courseIds.map((courseId) => ctx.db.get(courseId)),
  );
  const missingCourseId = courseIds.find((_, index) => !courses[index]);
  if (missingCourseId) {
    return adminCouponFailure(
      "One or more selected courses no longer exist",
      convexResultErrorCode.VALIDATION_ERROR,
    );
  }

  return null;
}

export const listCoupons = query({
  args: {
    search: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 100, 200);
    const scanLimit = args.search
      ? Math.min(Math.max(limit * 10, 500), 1500)
      : Math.min(Math.max(limit * 5, 200), 1000);

    let coupons = args.includeArchived
      ? await ctx.db
          .query("adminCoupons")
          .withIndex("by_updatedAt")
          .order("desc")
          .take(scanLimit)
      : await ctx.db
          .query("adminCoupons")
          .withIndex("by_isArchived_updatedAt", (q) =>
            q.eq("isArchived", false),
          )
          .order("desc")
          .take(scanLimit);

    if (args.search) {
      const search = args.search.toLowerCase();
      coupons = coupons.filter((coupon) =>
        [coupon.code, coupon.name, coupon.description ?? ""].some((part) =>
          part.toLowerCase().includes(search),
        ),
      );
    }

    return coupons.slice(0, limit);
  },
});

export const saveCoupon = mutation({
  args: {
    couponId: v.optional(v.id("adminCoupons")),
    ...adminCouponPayload,
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();
    const normalized = normalizeCoupon(args);
    if ("_tag" in normalized) {
      return normalized;
    }
    const courseFailure = await validateCouponCoursesExist(ctx, normalized);
    if (courseFailure) {
      return courseFailure;
    }

    const duplicate = await ctx.db
      .query("adminCoupons")
      .withIndex("by_code", (q) => q.eq("code", normalized.code))
      .first();
    if (duplicate && String(duplicate._id) !== String(args.couponId)) {
      return adminCouponFailure(
        "Another coupon already uses this code",
        convexResultErrorCode.CONFLICT,
      );
    }
    const mindPointsDuplicate = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", normalized.code))
      .first();
    if (mindPointsDuplicate) {
      return adminCouponFailure(
        "A Mind Points coupon already uses this code",
        convexResultErrorCode.CONFLICT,
      );
    }

    if (args.couponId) {
      const existing = await ctx.db.get(args.couponId);
      if (!existing) {
        return adminCouponFailure(
          "Coupon not found",
          convexResultErrorCode.NOT_FOUND,
        );
      }
      if (existing.isArchived && normalized.enabled) {
        return adminCouponFailure(
          "Archived coupons must be restored before they can be enabled",
          convexResultErrorCode.CONFLICT,
        );
      }

      await ctx.db.patch(args.couponId, {
        ...normalized,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });
      const updated = await ctx.db.get(args.couponId);
      if (!updated) {
        return adminCouponFailure(
          "Coupon could not be reloaded",
          convexResultErrorCode.NOT_FOUND,
        );
      }

      await createAdminAuditLog(ctx, {
        actorAdminId: admin.userId,
        actorEmail: admin.email,
        action: "admin_coupon.update",
        entityType: "adminCoupon",
        entityId: String(args.couponId),
        before: existing,
        after: updated,
      });

      return convexSuccess({ coupon: updated });
    }

    const couponId = await ctx.db.insert("adminCoupons", {
      ...normalized,
      isArchived: false,
      totalRedemptions: 0,
      createdAt: now,
      updatedAt: now,
      createdByAdminId: admin.userId,
      updatedByAdminId: admin.userId,
    });
    const created = await ctx.db.get(couponId);
    if (!created) {
      return adminCouponFailure(
        "Coupon could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "admin_coupon.create",
      entityType: "adminCoupon",
      entityId: String(couponId),
      after: created,
    });

    return convexSuccess({ coupon: created });
  },
});

export const setCouponArchived = mutation({
  args: {
    couponId: v.id("adminCoupons"),
    isArchived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.couponId);

    if (!existing) {
      return adminCouponFailure(
        "Coupon not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await ctx.db.patch(args.couponId, {
      isArchived: args.isArchived,
      enabled: args.isArchived ? false : existing.enabled,
      updatedAt: Date.now(),
      updatedByAdminId: admin.userId,
    });
    const updated = await ctx.db.get(args.couponId);
    if (!updated) {
      return adminCouponFailure(
        "Coupon could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: args.isArchived ? "admin_coupon.archive" : "admin_coupon.restore",
      entityType: "adminCoupon",
      entityId: String(args.couponId),
      before: existing,
      after: updated,
    });

    return convexSuccess({ coupon: updated });
  },
});

export const validateCouponCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const code = normalizeCouponCode(args.code);
    const coupon = await ctx.db
      .query("adminCoupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!coupon || !isCouponActive(coupon, Date.now())) {
      return convexFailure({
        code: convexResultErrorCode.INVALID_COUPON_CODE,
        message: "Invalid or inactive coupon code",
      });
    }

    return convexSuccess({
      coupon: {
        _id: String(coupon._id),
        code: coupon.code,
        name: coupon.name,
        enabled: coupon.enabled,
        isArchived: coupon.isArchived,
        discount: coupon.discount,
        appliesTo:
          coupon.appliesTo.type === "courses"
            ? {
                type: "courses" as const,
                courseIds: coupon.appliesTo.courseIds.map((courseId) =>
                  String(courseId),
                ),
              }
            : coupon.appliesTo,
        requires:
          coupon.requires.type === "courses"
            ? {
                type: "courses" as const,
                courseIds: coupon.requires.courseIds.map((courseId) =>
                  String(courseId),
                ),
              }
            : coupon.requires,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
      },
    });
  },
});
