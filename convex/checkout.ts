import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  buildCheckoutAttemptPayload,
  reconcileCheckoutIntent,
  type ReconciliationBatch,
  type ReconciliationBundleCampaign,
  type ReconciliationCartItem,
  type ReconciliationCourse,
} from "../lib/domain/checkout-reconciliation";

const cartIntentItemValidator = v.object({
  cartItemId: v.string(),
  courseId: v.id("courses"),
  batchId: v.optional(v.id("courseBatches")),
  quantity: v.optional(v.number()),
  selectedFreeCourseId: v.optional(v.id("courses")),
  selectedFreeBatchId: v.optional(v.id("courseBatches")),
  clientListedPrice: v.optional(v.number()),
  clientCheckoutPrice: v.optional(v.number()),
  couponCode: v.optional(v.string()),
  mindPointsRedeemed: v.optional(v.number()),
});

const cartIntentValidator = v.object({
  items: v.array(cartIntentItemValidator),
});

const MAX_BATCHES_PER_CART_COURSE = 200;

function courseToReconciliationCourse(
  course: Doc<"courses">,
): ReconciliationCourse {
  return {
    _id: String(course._id),
    name: course.name,
    code: course.code,
    type: course.type,
    lifecycleStatus: course.lifecycleStatus,
    mergedIntoCourseId: course.mergedIntoCourseId
      ? String(course.mergedIntoCourseId)
      : undefined,
    price: course.price,
    offer: course.offer,
    bogo: course.bogo,
    capacity: course.capacity,
    enrolledUsers: course.enrolledUsers,
    usesBatches: course.usesBatches,
    startDate: course.startDate,
    endDate: course.endDate,
  };
}

function batchToReconciliationBatch(
  batch: Doc<"courseBatches">,
): ReconciliationBatch {
  return {
    _id: String(batch._id),
    courseId: String(batch.courseId),
    label: batch.label,
    lifecycleStatus: batch.lifecycleStatus,
    startDate: batch.startDate,
    endDate: batch.endDate,
    capacity: batch.capacity,
    enrolledUsers: batch.enrolledUsers,
    sortOrder: batch.sortOrder,
  };
}

function campaignToReconciliationCampaign(
  campaign: Doc<"bundleCampaigns">,
): ReconciliationBundleCampaign {
  return {
    _id: String(campaign._id),
    name: campaign.name,
    flatFee: campaign.flatFee,
    requiredCourseCountMin: campaign.requiredCourseCountMin,
    requiredCourseCountMax: campaign.requiredCourseCountMax,
    eligibleCourseIds: campaign.eligibleCourseIds.map((courseId) =>
      String(courseId),
    ),
    priority: campaign.priority,
    enabled: campaign.enabled,
    isArchived: campaign.isArchived,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
  };
}

function normalizeCartIntentItems(
  items: Array<{
    cartItemId: string;
    courseId: Id<"courses">;
    batchId?: Id<"courseBatches">;
    quantity?: number;
    selectedFreeCourseId?: Id<"courses">;
    selectedFreeBatchId?: Id<"courseBatches">;
    clientListedPrice?: number;
    clientCheckoutPrice?: number;
    couponCode?: string;
    mindPointsRedeemed?: number;
  }>,
): ReconciliationCartItem[] {
  return items.map((item) => ({
    ...item,
    courseId: String(item.courseId),
    batchId: item.batchId ? String(item.batchId) : undefined,
    selectedFreeCourseId: item.selectedFreeCourseId
      ? String(item.selectedFreeCourseId)
      : undefined,
    selectedFreeBatchId: item.selectedFreeBatchId
      ? String(item.selectedFreeBatchId)
      : undefined,
  }));
}

async function collectCheckoutContext(
  ctx: QueryCtx | MutationCtx,
  cartItems: ReconciliationCartItem[],
  buyerUserId?: string,
) {
  const courseIdSet = new Set<string>();
  const batchIdSet = new Set<string>();
  for (const item of cartItems) {
    courseIdSet.add(String(item.courseId));
    if (item.selectedFreeCourseId)
      courseIdSet.add(String(item.selectedFreeCourseId));
    if (item.batchId) batchIdSet.add(String(item.batchId));
    if (item.selectedFreeBatchId)
      batchIdSet.add(String(item.selectedFreeBatchId));
  }

  const courses = (
    await Promise.all(
      Array.from(courseIdSet).map((courseId) =>
        ctx.db.get(courseId as Id<"courses">),
      ),
    )
  ).filter((course): course is Doc<"courses"> => course !== null);

  const batchesByCourse = await Promise.all(
    courses.map((course) =>
      ctx.db
        .query("courseBatches")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .take(MAX_BATCHES_PER_CART_COURSE),
    ),
  );
  const directBatches = (
    await Promise.all(
      Array.from(batchIdSet).map((batchId) =>
        ctx.db.get(batchId as Id<"courseBatches">),
      ),
    )
  ).filter((batch): batch is Doc<"courseBatches"> => batch !== null);
  const batchesById = new Map<string, Doc<"courseBatches">>();
  for (const batch of [...batchesByCourse.flat(), ...directBatches]) {
    batchesById.set(String(batch._id), batch);
  }

  const bundleCampaigns = await ctx.db
    .query("bundleCampaigns")
    .withIndex("by_enabled_isArchived_priority", (q) =>
      q.eq("enabled", true).eq("isArchived", false),
    )
    .order("desc")
    .take(50);

  const couponCodes = Array.from(
    new Set(
      cartItems
        .map((item) => item.couponCode?.trim())
        .filter((code): code is string => Boolean(code)),
    ),
  );
  const coupons = await Promise.all(
    couponCodes.map((code) =>
      ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first(),
    ),
  );
  const couponsByCode = new Map(
    coupons
      .filter(
        (coupon): coupon is NonNullable<typeof coupon> =>
          coupon !== null &&
          !!buyerUserId &&
          coupon.clerkUserId === buyerUserId &&
          !coupon.isUsed,
      )
      .map((coupon) => [coupon.code, coupon]),
  );
  const enrichedCartItems = cartItems.map((item) => {
    const coupon = item.couponCode
      ? couponsByCode.get(item.couponCode.trim())
      : null;

    return {
      ...item,
      couponDiscount: coupon?.discount,
      couponCourseType: coupon?.courseType,
      couponPointsCost: coupon?.pointsCost,
      mindPointsRedeemed: item.mindPointsRedeemed,
    };
  });

  return {
    cartItems: enrichedCartItems,
    courses: courses.map(courseToReconciliationCourse),
    batches: Array.from(batchesById.values()).map(batchToReconciliationBatch),
    bundleCampaigns: bundleCampaigns.map(campaignToReconciliationCampaign),
  };
}

async function runReconciliation(
  ctx: QueryCtx | MutationCtx,
  args: {
    cartIntent: { items: Parameters<typeof normalizeCartIntentItems>[0] };
    buyerUserId?: string;
  },
) {
  const cartItems = normalizeCartIntentItems(args.cartIntent.items);
  const context = await collectCheckoutContext(
    ctx,
    cartItems,
    args.buyerUserId,
  );

  return reconcileCheckoutIntent({
    items: context.cartItems,
    courses: context.courses,
    batches: context.batches,
    bundleCampaigns: context.bundleCampaigns,
  });
}

function assertCheckoutServerSecret(serverSecret: string) {
  const expected = process.env.CHECKOUT_SERVER_SECRET;
  if (!expected || serverSecret !== expected) {
    throw new Error("Unauthorized checkout server request.");
  }
}

async function createCheckoutAttemptForBuyer(
  ctx: MutationCtx,
  args: {
    cartIntent: { items: Parameters<typeof normalizeCartIntentItems>[0] };
    buyerUserId: string;
    buyerEmail?: string;
    referrerClerkUserId?: string;
  },
) {
  const reconciliation = await runReconciliation(ctx, {
    cartIntent: args.cartIntent,
    buyerUserId: args.buyerUserId,
  });
  if (reconciliation.status !== "valid" || reconciliation.totalAmountPaid <= 0) {
    return {
      ok: false,
      reconciliation,
    };
  }

  const now = Date.now();
  const payload = buildCheckoutAttemptPayload({
    reconciliation,
    buyerUserId: args.buyerUserId,
    buyerEmail: args.buyerEmail,
    referrerClerkUserId: args.referrerClerkUserId,
  });
  const checkoutAttemptId = await ctx.db.insert("checkoutAttempts", {
    ...payload,
    status: "created",
    createdAt: now,
    updatedAt: now,
  });

  return {
    ok: true,
    checkoutAttemptId,
    reconciliation,
  };
}

async function markCheckoutAttemptPaymentOrderedForBuyer(
  ctx: MutationCtx,
  args: {
    checkoutAttemptId: Id<"checkoutAttempts">;
    razorpayOrderId: string;
    buyerUserId: string;
  },
) {
  const attempt = await ctx.db.get(args.checkoutAttemptId);
  if (!attempt) {
    throw new Error("Checkout attempt not found.");
  }
  if (attempt.buyerUserId !== args.buyerUserId) {
    throw new Error("Checkout attempt does not belong to this user.");
  }
  if (attempt.status !== "created") {
    throw new Error("Checkout attempt is not ready for payment ordering.");
  }

  await ctx.db.patch(args.checkoutAttemptId, {
    razorpayOrderId: args.razorpayOrderId,
    status: "payment_ordered",
    updatedAt: Date.now(),
  });

  return await ctx.db.get(args.checkoutAttemptId);
}

export const reconcileCart = query({
  args: {
    cartIntent: cartIntentValidator,
    requestedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    return await runReconciliation(ctx, {
      ...args,
      buyerUserId: identity?.subject,
    });
  },
});

export const createCheckoutAttempt = mutation({
  args: {
    cartIntent: cartIntentValidator,
    buyerEmail: v.optional(v.string()),
    referrerClerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated checkout attempt.");
    }

    return await createCheckoutAttemptForBuyer(ctx, {
      cartIntent: args.cartIntent,
      buyerUserId: identity.subject,
      buyerEmail: args.buyerEmail,
      referrerClerkUserId: args.referrerClerkUserId,
    });
  },
});

export const createCheckoutAttemptFromServer = mutation({
  args: {
    serverSecret: v.string(),
    buyerUserId: v.string(),
    cartIntent: cartIntentValidator,
    buyerEmail: v.optional(v.string()),
    referrerClerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertCheckoutServerSecret(args.serverSecret);

    return await createCheckoutAttemptForBuyer(ctx, {
      cartIntent: args.cartIntent,
      buyerUserId: args.buyerUserId,
      buyerEmail: args.buyerEmail,
      referrerClerkUserId: args.referrerClerkUserId,
    });
  },
});

export const markCheckoutAttemptPaymentOrdered = mutation({
  args: {
    checkoutAttemptId: v.id("checkoutAttempts"),
    razorpayOrderId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated checkout attempt update.");
    }

    return await markCheckoutAttemptPaymentOrderedForBuyer(ctx, {
      checkoutAttemptId: args.checkoutAttemptId,
      razorpayOrderId: args.razorpayOrderId,
      buyerUserId: identity.subject,
    });
  },
});

export const markCheckoutAttemptPaymentOrderedFromServer = mutation({
  args: {
    serverSecret: v.string(),
    buyerUserId: v.string(),
    checkoutAttemptId: v.id("checkoutAttempts"),
    razorpayOrderId: v.string(),
  },
  handler: async (ctx, args) => {
    assertCheckoutServerSecret(args.serverSecret);

    return await markCheckoutAttemptPaymentOrderedForBuyer(ctx, {
      checkoutAttemptId: args.checkoutAttemptId,
      razorpayOrderId: args.razorpayOrderId,
      buyerUserId: args.buyerUserId,
    });
  },
});
