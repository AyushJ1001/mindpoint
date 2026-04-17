import type { Id } from "@mindpoint/backend/data-model";

import type { CourseBogo, CourseOffer } from "./pricing";

export function buildCartItemId(
  courseId: string,
  batchId?: string | null,
): string {
  return batchId ? `${courseId}:${batchId}` : courseId;
}

export interface SelectedFreeCourse {
  id: Id<"courses">;
  cartItemId?: string;
  courseId?: Id<"courses">;
  batchId?: Id<"courseBatches">;
  batchLabel?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrls?: string[];
  courseType?: string;
}

export interface ExtendedCartItem {
  id: string;
  courseId?: Id<"courses">;
  batchId?: Id<"courseBatches">;
  batchLabel?: string;
  batchStartDate?: string;
  batchEndDate?: string;
  batchStartTime?: string;
  batchEndTime?: string;
  batchDaysOfWeek?: string[];
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrls?: string[];
  capacity?: number;
  quantity: number;
  offer?: CourseOffer;
  bogo?: CourseBogo;
  courseType?: string;
  selectedFreeCourse?: SelectedFreeCourse;
}
