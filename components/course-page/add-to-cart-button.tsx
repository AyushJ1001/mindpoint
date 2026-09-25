"use client";

import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";

import type { Id } from "@/lib/backend/data-model";
import type { ProgrammeCartTarget } from "@/lib/course-content/types";

/**
 * Adds a programme option (or an upgrade) to the cart in one click, carrying
 * the cohort/batch details the checkout needs, then routes to the cart.
 * An upgrade coupon is passed through so the self-paced fee is credited.
 */
export function AddToCartButton({
  target,
  couponCode,
  label,
  className,
}: {
  target: ProgrammeCartTarget;
  couponCode?: string;
  label: string;
  className?: string;
}) {
  const { addItem, removeItem, inCart } = useCart();
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (inCart(target._id)) removeItem(target._id);
        addItem({
          id: target._id,
          courseId: target._id as Id<"courses">,
          name: target.batch?.label
            ? `${target.name} (${target.batch.label})`
            : target.name,
          description: target.description ?? "",
          price: target.price,
          originalPrice: target.originalPrice ?? target.price,
          imageUrls: target.imageUrls ?? [],
          capacity: target.batch?.capacity ?? 30,
          quantity: 1,
          courseType: target.courseType,
          batchId: target.batch?.id as Id<"courseBatches"> | undefined,
          batchLabel: target.batch?.label,
          batchStartDate: target.batch?.startDate,
          batchEndDate: target.batch?.endDate,
          batchStartTime: target.batch?.startTime,
          batchEndTime: target.batch?.endTime,
          batchDaysOfWeek: target.batch?.daysOfWeek,
        });
        router.push(
          couponCode
            ? `/cart?coupon=${encodeURIComponent(couponCode)}`
            : "/cart",
        );
      }}
    >
      {label}
    </button>
  );
}
