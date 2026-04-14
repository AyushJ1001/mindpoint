import type { Id } from "@mindpoint/backend/data-model";

import type { CourseBogo, CourseOffer } from "./pricing";

export interface SelectedFreeCourse {
  id: Id<"courses">;
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
  batchCode?: string;
  batchLabel?: string;
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
