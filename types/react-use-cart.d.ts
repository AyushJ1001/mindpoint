import { Id } from "@/convex/_generated/dataModel";

declare module "react-use-cart" {
  interface Item {
    name?: string;
    description?: string;
    originalPrice?: number;
    imageUrls?: string[];
    capacity?: number;
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
    selectedFreeCourse?: {
      id: Id<"courses">;
      name: string;
      description?: string;
      price: number;
      originalPrice?: number;
      imageUrls?: string[];
      courseType?: string;
    };
  }
}
