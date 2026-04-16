import type { Doc } from "./_generated/dataModel";
import type { PublicCourseBatch } from "./courseBatchHelpers";

export type PublicCourse = {
  _id: Doc<"courses">["_id"];
  _creationTime: number;
  name: string;
  description?: string;
  type?: Doc<"courses">["type"];
  code: string;
  price: number;
  offer?: Doc<"courses">["offer"];
  bogo?: Doc<"courses">["bogo"];
  sessions?: number;
  capacity: number;
  enrolledCount: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  content: string;
  reviews: Doc<"courses">["reviews"];
  duration?: string;
  prerequisites?: string;
  imageUrls?: string[];
  modules?: Doc<"courses">["modules"];
  learningOutcomes?: Doc<"courses">["learningOutcomes"];
  allocation?: Doc<"courses">["allocation"];
  fileUrl?: string;
  worksheetDescription?: string;
  targetAudience?: string[];
  emotionalHook?: string;
  painPoints?: string[];
  outcomes?: string[];
  whyDifferent?: string[];
  usesBatches: boolean;
  batchCount: number;
  nextAvailableBatch?: PublicCourseBatch;
};

export function pickPublicCourse(
  course: Doc<"courses">,
  options?: {
    batchCount?: number;
    nextAvailableBatch?: PublicCourseBatch | null;
  },
): PublicCourse {
  const nextAvailableBatch = options?.nextAvailableBatch ?? null;
  return {
    _id: course._id,
    _creationTime: course._creationTime,
    name: course.name,
    description: course.description,
    type: course.type,
    code: course.code,
    price: course.price,
    offer: course.offer,
    bogo: course.bogo,
    sessions: course.sessions,
    capacity: nextAvailableBatch?.capacity ?? course.capacity ?? 0,
    enrolledCount: nextAvailableBatch?.enrolledCount ?? course.enrolledUsers.length,
    startDate: nextAvailableBatch?.startDate ?? course.startDate ?? "",
    endDate: nextAvailableBatch?.endDate ?? course.endDate ?? "",
    startTime: nextAvailableBatch?.startTime ?? course.startTime ?? "",
    endTime: nextAvailableBatch?.endTime ?? course.endTime ?? "",
    daysOfWeek: nextAvailableBatch?.daysOfWeek ?? course.daysOfWeek ?? [],
    content: course.content,
    reviews: course.reviews,
    duration: course.duration,
    prerequisites: course.prerequisites,
    imageUrls: course.imageUrls,
    modules: course.modules,
    learningOutcomes: course.learningOutcomes,
    allocation: course.allocation,
    fileUrl: course.fileUrl,
    worksheetDescription: course.worksheetDescription,
    targetAudience: course.targetAudience,
    emotionalHook: course.emotionalHook,
    painPoints: course.painPoints,
    outcomes: course.outcomes,
    whyDifferent: course.whyDifferent,
    usesBatches: course.usesBatches ?? false,
    batchCount: options?.batchCount ?? 0,
    nextAvailableBatch: nextAvailableBatch ?? undefined,
  };
}
