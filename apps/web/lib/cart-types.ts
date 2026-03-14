import { Id } from "@/convex/_generated/dataModel";

// Extended cart item type that includes BOGO selection
export interface ExtendedCartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number; // Store original price for discount calculations
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
    label?: string;
  };
  courseType?: string;
  // New field for selected free course
  selectedFreeCourse?: {
    id: Id<"courses">;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number; // Store original price for discount calculations
    imageUrls?: string[];
    courseType?: string;
  };
}
