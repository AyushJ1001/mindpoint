import type { FunctionReturnType } from "convex/server";
import type { Doc } from "./data-model";
import { api } from "./api";

export type PublicCourse = FunctionReturnType<typeof api.courses.listCourses>[number];
export type PublicCoursesByTypeResult = FunctionReturnType<
  typeof api.courses.listCoursesByType
>;
export type CourseLike = PublicCourse | Doc<"courses">;
