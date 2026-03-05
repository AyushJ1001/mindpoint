"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminEnrollmentDetailPage() {
  const params = useParams<{ enrollmentId: string }>();
  const enrollmentId = params.enrollmentId as Id<"enrollments">;

  const [targetCourseId, setTargetCourseId] = useState("");

  const detail = useQuery(api.adminEnrollments.getEnrollmentDetail, {
    enrollmentId,
  });
  const courses = useQuery(api.adminCourses.listCourses, { limit: 500 });

  const transferEnrollment = useMutation(api.adminEnrollments.transferEnrollment);
  const cancelEnrollment = useMutation(api.adminEnrollments.cancelEnrollment);

  const transferableCourses = useMemo(() => {
    if (!detail || !courses) return [];
    return courses.filter((course) => course._id !== detail.courseId);
  }, [detail, courses]);

  const handleTransfer = async () => {
    if (!targetCourseId) {
      toast.error("Select a target course");
      return;
    }

    const reason = window.prompt("Transfer reason:", "Transferred by admin");
    if (!reason) return;

    try {
      await transferEnrollment({
        enrollmentId,
        targetCourseId: targetCourseId as Id<"courses">,
        reason,
      });
      toast.success("Enrollment transferred");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed");
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt("Cancellation reason:", "Cancelled by admin");
    if (!reason) return;

    try {
      await cancelEnrollment({ enrollmentId, reason });
      toast.success("Enrollment cancelled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cancellation failed");
    }
  };

  if (detail === undefined) {
    return <p className="text-sm text-slate-600">Loading enrollment...</p>;
  }

  if (!detail) {
    return <p className="text-sm text-slate-600">Enrollment not found.</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Enrollment ${detail.enrollmentNumber}`}
        description="View complete timeline and execute transfer/cancel operations."
      />

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <p><strong>User:</strong> {detail.userName || detail.userId}</p>
          <p><strong>Email:</strong> {detail.userEmail || "-"}</p>
          <p><strong>Course:</strong> {detail.courseName || "-"}</p>
          <p><strong>Status:</strong> <Badge variant="outline">{detail.status}</Badge></p>
          <p><strong>Type:</strong> {detail.courseType || "-"}</p>
          <p><strong>Created:</strong> {new Date(detail._creationTime).toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transfer / Cancel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={targetCourseId}
              onChange={(e) => setTargetCourseId(e.target.value)}
            >
              <option value="">Select transfer target</option>
              {transferableCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.type})
                </option>
              ))}
            </select>
            <Button onClick={handleTransfer} disabled={detail.status !== "active"}>
              Transfer Enrollment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={detail.status !== "active"}
            >
              Cancel Enrollment
            </Button>
          </div>
          {detail.status !== "active" ? (
            <p className="text-xs text-slate-600">
              This enrollment is {detail.status}. Transfer/cancel actions are only available for active enrollments.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Enrollments (same user)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {detail.relatedEnrollments.map((row) => (
              <div key={row._id} className="rounded-md border p-2 text-sm">
                <p className="font-medium">{row.courseName || row.courseId}</p>
                <p className="text-xs text-slate-600">
                  {row.enrollmentNumber} • {row.status}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
