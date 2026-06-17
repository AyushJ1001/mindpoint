import { calculateActiveOfferPrice } from "./pricing";
import {
  applyAdminCouponToItems,
  findAdminCouponByCode,
  normalizeAdminCouponCode,
  type ReconciliationAdminCoupon,
} from "./admin-coupons";

export type CheckoutRemovalReason =
  | "COURSE_UNAVAILABLE"
  | "COURSE_ARCHIVED"
  | "COURSE_MERGED"
  | "COURSE_PAST_END_DATE"
  | "BATCH_UNAVAILABLE"
  | "BATCH_PAST_END_DATE"
  | "BATCH_FULL"
  | "PRICE_CHANGED"
  | "DISCOUNT_EXPIRED"
  | "BOGO_EXPIRED"
  | "BOGO_SELECTION_INVALID"
  | "BUNDLE_EXPIRED"
  | "COUPON_INVALID"
  | "COUPON_ALREADY_USED"
  | "COUPON_NOT_OWNED"
  | "COUPON_TYPE_MISMATCH"
  | "COUPON_NOT_APPLICABLE"
  | "COUPON_EXPIRED";

export type CheckoutUpdateReason =
  | "PRICE_CHANGED"
  | "DISCOUNT_EXPIRED"
  | "BOGO_EXPIRED"
  | "BOGO_SELECTION_INVALID"
  | "BUNDLE_EXPIRED"
  | "COUPON_INVALID"
  | "COUPON_ALREADY_USED"
  | "COUPON_NOT_OWNED"
  | "COUPON_TYPE_MISMATCH"
  | "COUPON_NOT_APPLICABLE"
  | "COUPON_EXPIRED";

export type CheckoutReconciliationStatus = "valid" | "changed" | "blocked";

type CourseOffer = {
  name: string;
  discount?: number;
  discountType?: "percentage" | "fixedPrice" | "flatOff";
  discountValue?: number;
  startDate?: string;
  endDate?: string;
};

type CourseBogo = {
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  label?: string;
};

export type ReconciliationCourse = {
  _id: string;
  name: string;
  code?: string;
  type?: string;
  lifecycleStatus?: "draft" | "published" | "archived";
  mergedIntoCourseId?: string;
  price: number;
  offer?: CourseOffer;
  bogo?: CourseBogo;
  capacity?: number;
  enrolledUsers?: string[];
  usesBatches?: boolean;
  startDate?: string;
  endDate?: string;
};

export type ReconciliationBatch = {
  _id: string;
  courseId: string;
  label: string;
  lifecycleStatus?: "draft" | "published" | "archived";
  startDate?: string;
  endDate?: string;
  capacity?: number;
  enrolledUsers?: string[];
  sortOrder?: number;
};

export type ReconciliationBundleCampaign = {
  _id: string;
  name: string;
  flatFee: number;
  requiredCourseCountMin: number;
  requiredCourseCountMax: number;
  eligibleCourseIds: string[];
  priority: number;
  enabled: boolean;
  isArchived?: boolean;
  startDate?: string;
  endDate?: string;
};

export type ReconciliationCartItem = {
  cartItemId: string;
  courseId: string;
  batchId?: string;
  quantity?: number;
  selectedFreeCourseId?: string;
  selectedFreeBatchId?: string;
  clientListedPrice?: number;
  clientCheckoutPrice?: number;
  couponCode?: string;
  couponDiscount?: number;
  couponCourseType?: string;
  couponPointsCost?: number;
  mindPointsRedeemed?: number;
};

export type ReconciledCheckoutItem = {
  cartItemId: string;
  courseId: string;
  batchId?: string;
  selectedFreeCourseId?: string;
  selectedFreeBatchId?: string;
  listedPrice: number;
  checkoutPrice: number;
  amountPaid: number;
  redemptionDiscountAmount?: number;
  couponCode?: string;
  mindPointsRedeemed?: number;
  bundleCampaignId?: string;
  bundleCampaignName?: string;
  courseName: string;
  courseType?: string;
  batchLabel?: string;
  offerName?: string;
  bogoLabel?: string;
};

export type CheckoutPricingItem = {
  courseId: string;
  batchId?: string;
  listedPrice: number;
  checkoutPrice: number;
  amountPaid: number;
  redemptionDiscountAmount?: number;
  couponCode?: string;
  mindPointsRedeemed?: number;
  bundleCampaignId?: string;
  bundleCampaignName?: string;
};

export type CheckoutReconciliationResult = {
  status: CheckoutReconciliationStatus;
  items: ReconciledCheckoutItem[];
  removedItems: Array<{
    cartItemId: string;
    courseId: string;
    batchId?: string;
    reason: CheckoutRemovalReason;
    message: string;
  }>;
  updatedItems: Array<{
    cartItemId: string;
    courseId: string;
    batchId?: string;
    reasons: CheckoutUpdateReason[];
  }>;
  blockingReasons: CheckoutRemovalReason[];
  totalAmountPaid: number;
  checkoutPricing: {
    totalAmountPaid: number;
    items: CheckoutPricingItem[];
  };
  cartIntent: {
    items: ReconciliationCartItem[];
  };
};

export type CheckoutAttemptPayload = {
  cartIntent: {
    items: ReconciliationCartItem[];
  };
  authoritativeAmount: number;
  authoritativeLineItems: ReconciledCheckoutItem[];
  validationStatus: CheckoutReconciliationStatus;
  validationSummary: {
    removedItems: CheckoutReconciliationResult["removedItems"];
    updatedItems: CheckoutReconciliationResult["updatedItems"];
    blockingReasons: CheckoutRemovalReason[];
  };
  buyerUserId?: string;
  buyerEmail?: string;
  referrerClerkUserId?: string;
  status: "created";
};

function roundCurrency(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value!));
}

function toTimestamp(value?: string): number | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isWindowActive(
  value: { startDate?: string; endDate?: string },
  now: number,
) {
  const start = toTimestamp(value.startDate);
  const end = toTimestamp(value.endDate);

  if (start !== null && now < start) {
    return false;
  }

  if (end !== null && now > end) {
    return false;
  }

  return true;
}

function isOfferActive(offer: CourseOffer | undefined, now: number) {
  return !!offer && isWindowActive(offer, now);
}

function isBogoActive(bogo: CourseBogo | undefined, now: number) {
  return !!bogo?.enabled && isWindowActive(bogo, now);
}

function isPastEndDate(endDate: string | undefined, now: number) {
  const end = toTimestamp(endDate);
  return end !== null && end < now;
}

function getLifecycleStatus(value?: "draft" | "published" | "archived") {
  return value ?? "published";
}

function findDefaultOpenBatch(
  batches: ReconciliationBatch[],
  now: number,
): ReconciliationBatch | null {
  return (
    [...batches]
      .sort((left, right) => {
        const sortDelta = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
        if (sortDelta !== 0) return sortDelta;
        return (
          (toTimestamp(left.startDate) ?? 0) -
          (toTimestamp(right.startDate) ?? 0)
        );
      })
      .find((batch) => {
        if (getLifecycleStatus(batch.lifecycleStatus) !== "published") {
          return false;
        }
        if (isPastEndDate(batch.endDate, now)) {
          return false;
        }
        const capacity = roundCurrency(batch.capacity);
        return capacity <= 0 || (batch.enrolledUsers ?? []).length < capacity;
      }) ?? null
  );
}

function removalMessage(reason: CheckoutRemovalReason, name: string) {
  switch (reason) {
    case "BATCH_FULL":
      return `${name} was removed because the selected batch is full.`;
    case "BATCH_PAST_END_DATE":
      return `${name} was removed because the selected batch is no longer available.`;
    case "COURSE_PAST_END_DATE":
      return `${name} was removed because it is no longer available.`;
    case "COURSE_ARCHIVED":
    case "COURSE_UNAVAILABLE":
      return `${name} was removed because it is unavailable.`;
    case "COURSE_MERGED":
      return `${name} was removed because it has moved to a new course page.`;
    default:
      return `${name} was removed because checkout details changed.`;
  }
}

function getCourseRemovalReason(
  course: ReconciliationCourse | undefined,
  now: number,
): CheckoutRemovalReason | null {
  if (!course) {
    return "COURSE_UNAVAILABLE";
  }
  if (course.mergedIntoCourseId) {
    return "COURSE_MERGED";
  }
  if (getLifecycleStatus(course.lifecycleStatus) === "archived") {
    return "COURSE_ARCHIVED";
  }
  if (getLifecycleStatus(course.lifecycleStatus) !== "published") {
    return "COURSE_UNAVAILABLE";
  }
  if (isPastEndDate(course.endDate, now)) {
    return "COURSE_PAST_END_DATE";
  }

  return null;
}

function getBatchRemovalReason(
  item: ReconciliationCartItem,
  course: ReconciliationCourse,
  batch: ReconciliationBatch | null,
  now: number,
): CheckoutRemovalReason | null {
  if (!course.usesBatches) {
    const capacity = roundCurrency(course.capacity);
    if (capacity > 0 && (course.enrolledUsers ?? []).length >= capacity) {
      return "BATCH_FULL";
    }
    return null;
  }

  if (!batch || String(batch.courseId) !== String(course._id)) {
    return "BATCH_UNAVAILABLE";
  }

  if (getLifecycleStatus(batch.lifecycleStatus) !== "published") {
    return "BATCH_UNAVAILABLE";
  }

  if (isPastEndDate(batch.endDate, now)) {
    return "BATCH_PAST_END_DATE";
  }

  const capacity = roundCurrency(batch.capacity);
  if (capacity > 0 && (batch.enrolledUsers ?? []).length >= capacity) {
    return "BATCH_FULL";
  }

  if (item.batchId && String(item.batchId) !== String(batch._id)) {
    return "BATCH_UNAVAILABLE";
  }

  return null;
}

export function reconcileCheckoutIntent(input: {
  items: ReconciliationCartItem[];
  courses: ReconciliationCourse[];
  batches: ReconciliationBatch[];
  bundleCampaigns: ReconciliationBundleCampaign[];
  adminCoupons?: ReconciliationAdminCoupon[];
  now?: number | Date;
}): CheckoutReconciliationResult {
  const now =
    input.now instanceof Date ? input.now.getTime() : (input.now ?? Date.now());
  const coursesById = new Map(
    input.courses.map((course) => [String(course._id), course]),
  );
  const batchesById = new Map(
    input.batches.map((batch) => [String(batch._id), batch]),
  );
  const batchesByCourseId = new Map<string, ReconciliationBatch[]>();
  for (const batch of input.batches) {
    const key = String(batch.courseId);
    batchesByCourseId.set(key, [...(batchesByCourseId.get(key) ?? []), batch]);
  }

  const items: ReconciledCheckoutItem[] = [];
  const removedItems: CheckoutReconciliationResult["removedItems"] = [];
  const updatedItems: CheckoutReconciliationResult["updatedItems"] = [];
  const blockingReasons: CheckoutRemovalReason[] = [];
  const updateReasonsByCartItem = new Map<string, CheckoutUpdateReason[]>();
  const expiredOfferByCartItem = new Map<string, boolean>();
  const inputByCartItem = new Map(
    input.items.map((item) => [item.cartItemId, item]),
  );
  const requestedAdminCouponCode = input.items
    .map((item) => item.couponCode?.trim())
    .filter((code): code is string => Boolean(code))
    .map(normalizeAdminCouponCode)
    .find((code) => findAdminCouponByCode(input.adminCoupons ?? [], code));
  const requestedAdminCoupon = findAdminCouponByCode(
    input.adminCoupons ?? [],
    requestedAdminCouponCode,
  );

  for (const item of input.items) {
    const course = coursesById.get(String(item.courseId));
    const courseRemovalReason = getCourseRemovalReason(course, now);
    if (courseRemovalReason || !course) {
      const reason = courseRemovalReason ?? "COURSE_UNAVAILABLE";
      removedItems.push({
        cartItemId: item.cartItemId,
        courseId: item.courseId,
        batchId: item.batchId,
        reason,
        message: removalMessage(reason, course?.name ?? "This course"),
      });
      blockingReasons.push(reason);
      continue;
    }

    const selectedBatch = item.batchId
      ? (batchesById.get(String(item.batchId)) ?? null)
      : findDefaultOpenBatch(
          batchesByCourseId.get(String(course._id)) ?? [],
          now,
        );
    const batchRemovalReason = getBatchRemovalReason(
      item,
      course,
      selectedBatch,
      now,
    );
    if (batchRemovalReason) {
      removedItems.push({
        cartItemId: item.cartItemId,
        courseId: item.courseId,
        batchId: item.batchId,
        reason: batchRemovalReason,
        message: removalMessage(batchRemovalReason, course.name),
      });
      blockingReasons.push(batchRemovalReason);
      continue;
    }

    const listedPrice = roundCurrency(course.price);
    const activeOffer = isOfferActive(course.offer, now) ? course.offer : null;
    const checkoutPrice = activeOffer
      ? calculateActiveOfferPrice(listedPrice, activeOffer)
      : listedPrice;
    let amountPaid = checkoutPrice;
    let redemptionDiscountAmount: number | undefined;
    let couponCode: string | undefined;
    let mindPointsRedeemed: number | undefined;
    const reasons: CheckoutUpdateReason[] = [];

    if (item.couponCode && !requestedAdminCoupon) {
      const normalizedCoupon = item.couponCode.trim();
      if (
        !Number.isFinite(item.couponDiscount) ||
        !item.couponCourseType ||
        !Number.isFinite(item.couponPointsCost)
      ) {
        reasons.push("COUPON_INVALID");
      } else if (item.couponCourseType !== course.type) {
        reasons.push("COUPON_TYPE_MISMATCH");
      } else {
        const couponDiscount = Math.min(
          checkoutPrice,
          Math.round(checkoutPrice * (item.couponDiscount! / 100)),
        );
        amountPaid = Math.max(0, checkoutPrice - couponDiscount);
        redemptionDiscountAmount =
          couponDiscount > 0 ? couponDiscount : undefined;
        couponCode = normalizedCoupon;
        mindPointsRedeemed =
          couponDiscount > 0 ? roundCurrency(item.couponPointsCost) : undefined;
      }
    }

    expiredOfferByCartItem.set(item.cartItemId, !!course.offer && !activeOffer);

    let selectedFreeCourseId = item.selectedFreeCourseId;
    let selectedFreeBatchId = item.selectedFreeBatchId;
    if (item.selectedFreeCourseId) {
      if (!isBogoActive(course.bogo, now)) {
        selectedFreeCourseId = undefined;
        selectedFreeBatchId = undefined;
        reasons.push("BOGO_EXPIRED");
      } else {
        const selectedFreeCourse = coursesById.get(
          String(item.selectedFreeCourseId),
        );
        if (
          !selectedFreeCourse ||
          selectedFreeCourse._id === course._id ||
          selectedFreeCourse.type !== course.type ||
          getCourseRemovalReason(selectedFreeCourse, now)
        ) {
          selectedFreeCourseId = undefined;
          selectedFreeBatchId = undefined;
          reasons.push("BOGO_SELECTION_INVALID");
        }
      }
    }

    if (reasons.length > 0) {
      updateReasonsByCartItem.set(item.cartItemId, reasons);
    }

    items.push({
      cartItemId: item.cartItemId,
      courseId: String(course._id),
      batchId: selectedBatch?._id,
      selectedFreeCourseId,
      selectedFreeBatchId,
      listedPrice,
      checkoutPrice,
      amountPaid,
      redemptionDiscountAmount,
      couponCode,
      mindPointsRedeemed,
      courseName: course.name,
      courseType: course.type,
      batchLabel: selectedBatch?.label,
      offerName: activeOffer?.name,
      bogoLabel: isBogoActive(course.bogo, now)
        ? course.bogo?.label
        : undefined,
    });
  }

  const activeBundleCampaigns = input.bundleCampaigns
    .filter((campaign) => campaign.enabled && !campaign.isArchived)
    .filter((campaign) => isWindowActive(campaign, now));
  const bestBundle = activeBundleCampaigns
    .map((campaign) => {
      const eligibleIdSet = new Set(
        campaign.eligibleCourseIds.map((courseId) => String(courseId)),
      );
      const coveredItems = items.filter((item) =>
        eligibleIdSet.has(String(item.courseId)),
      );
      const coveredListedSubtotal = coveredItems.reduce(
        (total, item) => total + item.listedPrice,
        0,
      );
      const selectedCount = coveredItems.length;
      const minCount = Math.max(0, Math.round(campaign.requiredCourseCountMin));
      const maxCount = Math.max(0, Math.round(campaign.requiredCourseCountMax));
      const flatFee = roundCurrency(campaign.flatFee);
      if (
        selectedCount < minCount ||
        selectedCount > maxCount ||
        coveredListedSubtotal <= 0 ||
        flatFee >= coveredListedSubtotal
      ) {
        return null;
      }

      return {
        campaign,
        coveredItems,
        flatFee,
      };
    })
    .filter(
      (candidate): candidate is NonNullable<typeof candidate> =>
        candidate !== null,
    )
    .sort((left, right) => {
      if (left.campaign.priority !== right.campaign.priority) {
        return right.campaign.priority - left.campaign.priority;
      }
      return String(left.campaign._id).localeCompare(
        String(right.campaign._id),
      );
    })[0];

  if (bestBundle) {
    const covered = [...bestBundle.coveredItems].sort((left, right) =>
      String(left.courseId).localeCompare(String(right.courseId)),
    );
    const totalListed = covered.reduce(
      (total, item) => total + item.listedPrice,
      0,
    );
    let allocated = 0;

    covered.forEach((item, index) => {
      const amountPaid =
        index === covered.length - 1
          ? bestBundle.flatFee - allocated
          : Math.floor((bestBundle.flatFee * item.listedPrice) / totalListed);
      allocated += amountPaid;
      item.checkoutPrice = item.listedPrice;
      item.amountPaid = amountPaid;
      item.redemptionDiscountAmount = Math.max(
        0,
        item.listedPrice - amountPaid,
      );
      item.bundleCampaignId = bestBundle.campaign._id;
      item.bundleCampaignName = bestBundle.campaign.name;
    });
  }

  if (requestedAdminCoupon) {
    const application = applyAdminCouponToItems({
      coupon: requestedAdminCoupon,
      items: items.map((item) => ({
        cartItemId: item.cartItemId,
        courseId: item.courseId,
        courseType: item.courseType,
        amountPaid: item.bundleCampaignId ? 0 : item.amountPaid,
        redemptionDiscountAmount: item.redemptionDiscountAmount,
        couponCode: item.couponCode,
      })),
      now,
    });

    const cartItemIdsWithRequestedCode = new Set(
      input.items
        .filter(
          (item) =>
            item.couponCode &&
            normalizeAdminCouponCode(item.couponCode) ===
              normalizeAdminCouponCode(requestedAdminCoupon.code),
        )
        .map((item) => item.cartItemId),
    );

    if (application.applied) {
      for (const item of items) {
        const discount = application.itemDiscounts.get(item.cartItemId) ?? 0;
        if (discount <= 0) {
          continue;
        }

        item.amountPaid = Math.max(0, item.amountPaid - discount);
        item.redemptionDiscountAmount =
          roundCurrency(item.redemptionDiscountAmount) + discount;
        item.couponCode = normalizeAdminCouponCode(application.coupon.code);
      }
    } else {
      for (const item of items) {
        if (!cartItemIdsWithRequestedCode.has(item.cartItemId)) {
          continue;
        }

        updateReasonsByCartItem.set(item.cartItemId, [
          ...(updateReasonsByCartItem.get(item.cartItemId) ?? []),
          application.reason,
        ]);
      }
    }
  }

  for (const item of items) {
    const inputItem = inputByCartItem.get(item.cartItemId);
    if (!inputItem) {
      continue;
    }

    const reasons = [...(updateReasonsByCartItem.get(item.cartItemId) ?? [])];
    const clientCheckoutPrice = roundCurrency(inputItem.clientCheckoutPrice);
    if (
      expiredOfferByCartItem.get(item.cartItemId) &&
      clientCheckoutPrice !== item.amountPaid
    ) {
      reasons.push("DISCOUNT_EXPIRED");
    }
    if (clientCheckoutPrice !== item.amountPaid) {
      reasons.push("PRICE_CHANGED");
    }

    if (reasons.length > 0) {
      updatedItems.push({
        cartItemId: item.cartItemId,
        courseId: item.courseId,
        batchId: item.batchId,
        reasons: Array.from(new Set(reasons)),
      });
    }
  }

  const totalAmountPaid = items.reduce(
    (total, item) => total + item.amountPaid,
    0,
  );
  const status: CheckoutReconciliationStatus =
    blockingReasons.length > 0
      ? "blocked"
      : removedItems.length > 0 || updatedItems.length > 0
        ? "changed"
        : "valid";

  return {
    status,
    items,
    removedItems,
    updatedItems,
    blockingReasons,
    totalAmountPaid,
    checkoutPricing: {
      totalAmountPaid,
      items: items.map((item) => ({
        courseId: item.courseId,
        batchId: item.batchId,
        listedPrice: item.listedPrice,
        checkoutPrice: item.checkoutPrice,
        amountPaid: item.amountPaid,
        redemptionDiscountAmount: item.redemptionDiscountAmount,
        couponCode: item.couponCode,
        mindPointsRedeemed: item.mindPointsRedeemed,
        bundleCampaignId: item.bundleCampaignId,
        bundleCampaignName: item.bundleCampaignName,
      })),
    },
    cartIntent: {
      items: input.items.map((item) => ({ ...item })),
    },
  };
}

export function buildCheckoutAttemptPayload(input: {
  reconciliation: CheckoutReconciliationResult;
  buyerUserId?: string;
  buyerEmail?: string;
  referrerClerkUserId?: string;
}): CheckoutAttemptPayload {
  return {
    cartIntent: input.reconciliation.cartIntent,
    authoritativeAmount: input.reconciliation.totalAmountPaid,
    authoritativeLineItems: input.reconciliation.items,
    validationStatus: input.reconciliation.status,
    validationSummary: {
      removedItems: input.reconciliation.removedItems,
      updatedItems: input.reconciliation.updatedItems,
      blockingReasons: input.reconciliation.blockingReasons,
    },
    buyerUserId: input.buyerUserId,
    buyerEmail: input.buyerEmail,
    referrerClerkUserId: input.referrerClerkUserId,
    status: "created",
  };
}
