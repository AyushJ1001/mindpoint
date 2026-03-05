"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CourseEditor } from "@/components/admin/CourseEditor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminEditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId as Id<"courses">;

  const course = useQuery(api.adminCourses.getCourseById, { courseId });
  const transition = useMutation(api.adminCourses.transitionCourseLifecycle);

  const runTransition = async (status: "draft" | "published" | "archived") => {
    try {
      await transition({ courseId, lifecycleStatus: status });
      toast.success(`Course moved to ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transition failed");
    }
  };

  if (course === undefined) {
    return <p className="text-sm text-slate-600">Loading course...</p>;
  }

  if (!course) {
    return <p className="text-sm text-slate-600">Course not found.</p>;
  }

  const editorKey = `${course._id}:${course.updatedAt ?? course._creationTime}`;

  return (
    <div>
      <AdminPageHeader
        title={`Edit Course: ${course.name}`}
        description="Update metadata, offers, BOGO, lifecycle, and assets."
        actions={
          <>
            <Button variant="outline" onClick={() => runTransition("draft")}>
              Move to Draft
            </Button>
            <Button
              variant="outline"
              onClick={() => runTransition("published")}
            >
              Publish
            </Button>
            <Button
              variant="destructive"
              onClick={() => runTransition("archived")}
            >
              Archive
            </Button>
          </>
        }
      />

      <CourseEditor key={editorKey} course={course} />
    </div>
  );
}
