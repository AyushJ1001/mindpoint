"use client";
import { api } from "@/convex/_generated/api";
import CourseClient from "./CourseClient";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  const course = useQuery(api.courses.getCourseById, {
    id: id as Id<"courses">,
  });
  // Prefetch related variants (same name & type) to enable instant switching
  const variants = useQuery(api.courses.getRelatedVariants, {
    id: id as Id<"courses">,
  });
  if (course === undefined) return null; // loading
  if (course === null) return <div>Course not found</div>;
  return <CourseClient course={course} variants={variants ?? []} />;
}
