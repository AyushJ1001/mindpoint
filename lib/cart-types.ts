import { Id } from "@/convex/_generated/dataModel";

// Extended cart item type that includes BOGO selection
export interface ExtendedCartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrls?: string[];
  capacity?: number;
  quantity: number;
  offer?: {
    name: string;
    discount?: number;
    startDate?: string;
    endDate?: string;
  };
  bogo?: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    freeCourseId?: Id<"courses">;
    label?: string;
  };
  // New field for selected free course
  selectedFreeCourse?: {
    id: Id<"courses">;
    name: string;
    description?: string;
    price: number;
    imageUrls?: string[];
  };
}
