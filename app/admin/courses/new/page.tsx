"use client";

import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CourseEditor } from "@/components/admin/CourseEditor";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AdminNewCoursePage() {
  const router = useRouter();

  return (
    <div>
      <AdminPageHeader
        title="Create Course"
        description="Create a new course draft, then publish when validation is complete."
      />
      <ErrorBoundary label="Course editor">
        <CourseEditor
          onSaved={(courseId) => router.push(`/admin/courses/${courseId}`)}
        />
      </ErrorBoundary>
    </div>
  );
}
