export type AdminCouponDiscount =
  | {
      type: "percentage";
      value: number;
      maxDiscount?: number;
    }
  | {
      type: "flat";
      value: number;
    }
  | {
      type: "free";
    };

export type AdminCouponSelector =
  | {
      type: "cart";
    }
  | {
      type: "courses";
      courseIds: string[];
    }
  | {
      type: "courseTypes";
      courseTypes: string[];
    };

export type AdminCouponRequirement =
  | {
      type: "none";
    }
  | {
      type: "courses";
      courseIds: string[];
    }
  | {
      type: "courseTypes";
      courseTypes: string[];
    };

export type ReconciliationAdminCoupon = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  enabled: boolean;
  isArchived?: boolean;
  discount: AdminCouponDiscount;
  appliesTo: AdminCouponSelector;
  requires: AdminCouponRequirement;
  startDate?: string;
  endDate?: string;
  redemptionLimit?: number;
  totalRedemptions?: number;
};

export type AdminCouponLineItem = {
  cartItemId: string;
  courseId: string;
  courseType?: string;
  amountPaid: number;
  redemptionDiscountAmount?: number;
  couponCode?: string;
};

export type AdminCouponApplicationResult =
  | {
      applied: true;
      discountAmount: number;
      coupon: ReconciliationAdminCoupon;
      itemDiscounts: Map<string, number>;
    }
  | {
      applied: false;
      reason: "COUPON_EXPIRED" | "COUPON_INVALID" | "COUPON_NOT_APPLICABLE";
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

export function normalizeAdminCouponCode(code: string) {
  return code.trim().toUpperCase();
}

function itemMatchesSelector(
  item: AdminCouponLineItem,
  selector: AdminCouponSelector,
) {
  if (selector.type === "cart") {
    return true;
  }

  if (selector.type === "courses") {
    return selector.courseIds.map(String).includes(String(item.courseId));
  }

  return !!item.courseType && selector.courseTypes.includes(item.courseType);
}

function cartSatisfiesRequirement(
  items: AdminCouponLineItem[],
  requirement: AdminCouponRequirement,
) {
  if (requirement.type === "none") {
    return true;
  }

  if (requirement.type === "courses") {
    const presentCourseIds = new Set(
      items.map((item) => String(item.courseId)),
    );
    return requirement.courseIds.some((courseId) =>
      presentCourseIds.has(String(courseId)),
    );
  }

  const presentCourseTypes = new Set(
    items.map((item) => item.courseType).filter(Boolean),
  );
  return requirement.courseTypes.some((courseType) =>
    presentCourseTypes.has(courseType),
  );
}

function allocateDiscount(input: {
  coupon: ReconciliationAdminCoupon;
  items: AdminCouponLineItem[];
  discountAmount: number;
}): Map<string, number> {
  const { coupon, items, discountAmount } = input;
  const positiveItems = items.filter(
    (item) => roundCurrency(item.amountPaid) > 0,
  );
  const itemDiscounts = new Map<string, number>();

  if (positiveItems.length === 0 || discountAmount <= 0) {
    return itemDiscounts;
  }

  if (coupon.discount.type === "percentage") {
    let remainingDiscount = discountAmount;
    for (const item of positiveItems) {
      const lineDiscount = Math.min(
        roundCurrency(item.amountPaid),
        Math.round(
          roundCurrency(item.amountPaid) * (coupon.discount.value / 100),
        ),
        remainingDiscount,
      );
      remainingDiscount -= lineDiscount;
      if (lineDiscount > 0) {
        itemDiscounts.set(item.cartItemId, lineDiscount);
      }
      if (remainingDiscount <= 0) {
        break;
      }
    }
    return itemDiscounts;
  }

  let remainingDiscount = discountAmount;
  for (const item of positiveItems) {
    const lineDiscount = Math.min(
      roundCurrency(item.amountPaid),
      remainingDiscount,
    );
    remainingDiscount -= lineDiscount;
    if (lineDiscount > 0) {
      itemDiscounts.set(item.cartItemId, lineDiscount);
    }
    if (remainingDiscount <= 0) {
      break;
    }
  }

  return itemDiscounts;
}

export function findAdminCouponByCode(
  coupons: ReconciliationAdminCoupon[],
  code: string | undefined,
) {
  if (!code) {
    return null;
  }

  const normalizedCode = normalizeAdminCouponCode(code);
  return (
    coupons.find(
      (coupon) => normalizeAdminCouponCode(coupon.code) === normalizedCode,
    ) ?? null
  );
}

export function applyAdminCouponToItems(input: {
  coupon: ReconciliationAdminCoupon;
  items: AdminCouponLineItem[];
  now: number;
}): AdminCouponApplicationResult {
  const { coupon, items, now } = input;

  if (
    !coupon.enabled ||
    coupon.isArchived ||
    !isWindowActive(coupon, now) ||
    (coupon.redemptionLimit !== undefined &&
      roundCurrency(coupon.redemptionLimit) > 0 &&
      roundCurrency(coupon.totalRedemptions) >=
        roundCurrency(coupon.redemptionLimit))
  ) {
    return { applied: false, reason: "COUPON_EXPIRED" };
  }

  if (!cartSatisfiesRequirement(items, coupon.requires)) {
    return { applied: false, reason: "COUPON_NOT_APPLICABLE" };
  }

  const eligibleItems = items.filter((item) =>
    itemMatchesSelector(item, coupon.appliesTo),
  );
  const eligibleSubtotal = eligibleItems.reduce(
    (total, item) => total + roundCurrency(item.amountPaid),
    0,
  );

  if (eligibleSubtotal <= 0) {
    return { applied: false, reason: "COUPON_NOT_APPLICABLE" };
  }

  if (coupon.discount.type === "free") {
    const freeItem = [...eligibleItems].sort(
      (left, right) =>
        roundCurrency(right.amountPaid) - roundCurrency(left.amountPaid),
    )[0];
    if (!freeItem || roundCurrency(freeItem.amountPaid) <= 0) {
      return { applied: false, reason: "COUPON_NOT_APPLICABLE" };
    }

    return {
      applied: true,
      coupon,
      discountAmount: roundCurrency(freeItem.amountPaid),
      itemDiscounts: new Map([
        [freeItem.cartItemId, roundCurrency(freeItem.amountPaid)],
      ]),
    };
  }

  const rawDiscount =
    coupon.discount.type === "percentage"
      ? Math.round(eligibleSubtotal * (coupon.discount.value / 100))
      : roundCurrency(coupon.discount.value);
  const cappedDiscount =
    coupon.discount.type === "percentage" &&
    coupon.discount.maxDiscount !== undefined
      ? Math.min(rawDiscount, roundCurrency(coupon.discount.maxDiscount))
      : rawDiscount;
  const discountAmount = Math.min(eligibleSubtotal, cappedDiscount);

  if (discountAmount <= 0) {
    return { applied: false, reason: "COUPON_INVALID" };
  }

  return {
    applied: true,
    coupon,
    discountAmount,
    itemDiscounts: allocateDiscount({
      coupon,
      items: eligibleItems,
      discountAmount,
    }),
  };
}
