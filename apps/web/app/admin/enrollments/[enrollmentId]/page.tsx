"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { Id } from "@mindpoint/backend/data-model";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminTimeZone } from "@/components/admin/AdminTimeZoneProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { showRupees } from "@/lib/utils";

export default function AdminEnrollmentDetailPage() {
  const params = useParams<{ enrollmentId: string }>();
  const enrollmentId = params.enrollmentId as Id<"enrollments">;

  const [targetCourseId, setTargetCourseId] = useState("");
  const [targetBatchId, setTargetBatchId] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "change_batch" | "transfer" | "cancel" | null
  >(null);
  const [actionReason, setActionReason] = useState("Cancelled by admin");
  const { formatTimestamp } = useAdminTimeZone();

  const detail = useQuery(api.adminEnrollments.getEnrollmentDetail, {
    enrollmentId,
  });
  const courses = useQuery(api.adminCourses.listCourses, { limit: 500 });
  const batches = useQuery(
    api.adminCourses.listCourseBatches,
    detail?.course?.usesBatches ? { courseId: detail.courseId } : "skip",
  );

  const transferEnrollment = useMutation(
    api.adminEnrollments.transferEnrollment,
  );
  const changeEnrollmentBatch = useMutation(
    api.adminEnrollments.changeEnrollmentBatch,
  );
  const cancelEnrollment = useMutation(api.adminEnrollments.cancelEnrollment);

  const transferableCourses = useMemo(() => {
    if (!detail || !courses) return [];
    return courses.filter((course) => course._id !== detail.courseId);
  }, [detail, courses]);

  const handleTransfer = () => {
    if (!targetCourseId) {
      toast.error("Select a target course");
      return;
    }
    setActionReason("Transferred by admin");
    setPendingAction("transfer");
  };

  const handleCancel = () => {
    setActionReason("Cancelled by admin");
    setPendingAction("cancel");
  };

  const handleChangeBatch = () => {
    if (!targetBatchId) {
      toast.error("Select a target batch");
      return;
    }
    setActionReason("Batch changed by admin");
    setPendingAction("change_batch");
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || !actionReason.trim()) return;
    try {
      if (pendingAction === "change_batch") {
        await changeEnrollmentBatch({
          enrollmentId,
          batchId: targetBatchId as Id<"courseBatches">,
          reason: actionReason.trim(),
        });
        toast.success("Enrollment batch updated");
      } else if (pendingAction === "transfer") {
        await transferEnrollment({
          enrollmentId,
          targetCourseId: targetCourseId as Id<"courses">,
          reason: actionReason.trim(),
        });
        toast.success("Enrollment transferred");
      } else {
        await cancelEnrollment({ enrollmentId, reason: actionReason.trim() });
        toast.success("Enrollment cancelled");
      }
      setPendingAction(null);
      setActionReason("Cancelled by admin");
      setTargetBatchId("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : pendingAction === "change_batch"
            ? "Batch update failed"
            : pendingAction === "transfer"
            ? "Transfer failed"
            : "Cancellation failed",
      );
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
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/admin/courses/${detail.courseId}`}>Admin Course</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/courses/${detail.courseId}`} target="_blank">
                Live Course Page
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <p>
            <strong>User:</strong> {detail.userName || detail.userId}
          </p>
          <p>
            <strong>User ID:</strong> {detail.userId}
          </p>
          <p>
            <strong>Email:</strong> {detail.userEmail || "-"}
          </p>
          <p>
            <strong>Course:</strong> {detail.courseName || "-"}
          </p>
          <p>
            <strong>Batch:</strong> {detail.batchLabel || "—"}
          </p>
          <p>
            <strong>Batch Schedule:</strong>{" "}
            {[detail.batchStartDate, detail.batchEndDate]
              .filter(Boolean)
              .join(" to ") || "—"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <Badge variant="outline">{detail.status}</Badge>
          </p>
          <p>
            <strong>Type:</strong> {detail.courseType || "-"}
          </p>
          <p>
            <strong>Created:</strong> {formatTimestamp(detail._creationTime)}
          </p>
          <p>
            <strong>Paid:</strong>{" "}
            {detail.amountPaid != null
              ? showRupees(detail.amountPaid)
              : detail.checkoutPrice != null
                ? showRupees(detail.checkoutPrice)
                : "—"}
          </p>
          <p>
            <strong>Checkout Price:</strong>{" "}
            {detail.checkoutPrice != null
              ? showRupees(detail.checkoutPrice)
              : detail.listedPrice != null
                ? showRupees(detail.listedPrice)
                : "—"}
          </p>
          <p>
            <strong>Listed Price:</strong>{" "}
            {detail.listedPrice != null ? showRupees(detail.listedPrice) : "—"}
          </p>
          <p>
            <strong>Mind Points Redeemed:</strong>{" "}
            {detail.mindPointsRedeemed ?? 0}
          </p>
          <p>
            <strong>Coupon Code:</strong> {detail.couponCode || "-"}
          </p>
          <p>
            <strong>Bundle Campaign:</strong> {detail.bundleCampaignName || "-"}
          </p>
          <p>
            <strong>Registration Source:</strong>{" "}
            {detail.registrationSource || "checkout"}
          </p>
          <p>
            <strong>Last Confirmation Email:</strong>{" "}
            {detail.lastConfirmationSentAt
              ? formatTimestamp(detail.lastConfirmationSentAt)
              : "Not resent yet"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transfer / Cancel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {detail.course?.usesBatches ? (
            <div className="grid gap-3 md:grid-cols-3">
              <select
                className="h-10 rounded-md border bg-white px-3 text-sm"
                value={targetBatchId}
                onChange={(e) => setTargetBatchId(e.target.value)}
              >
                <option value="">Select replacement batch</option>
                {(batches ?? [])
                  .filter((batch) => batch._id !== detail.batchId)
                  .map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.label} ({batch.startDate})
                    </option>
                  ))}
              </select>
              <Button
                onClick={handleChangeBatch}
                disabled={detail.status !== "active"}
              >
                Change Batch
              </Button>
            </div>
          ) : null}
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
            <Button
              onClick={handleTransfer}
              disabled={detail.status !== "active"}
            >
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
              This enrollment is {detail.status}. Transfer/cancel actions are
              only available for active enrollments.
            </p>
          ) : detail.course?.usesBatches ? (
            <p className="text-xs text-slate-600">
              Batch changes keep the canonical course the same and rebalance
              seats between the old and new batches.
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

      <Dialog
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
            setActionReason("Cancelled by admin");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "change_batch"
                ? "Change Batch"
                : pendingAction === "transfer"
                  ? "Transfer Enrollment"
                  : "Cancel Enrollment"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              {pendingAction === "change_batch"
                ? "Provide a reason for changing this enrollment's batch."
                : pendingAction === "transfer"
                  ? "Provide a reason for transferring this enrollment."
                  : "Provide a reason for cancelling this enrollment."}
            </p>
            <Input
              placeholder="Reason"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPendingAction(null);
                setActionReason("Cancelled by admin");
              }}
            >
              Back
            </Button>
            <Button
              variant={pendingAction === "transfer" ? "default" : "destructive"}
              disabled={
                !pendingAction ||
                !actionReason.trim() ||
                (pendingAction === "change_batch" && !targetBatchId) ||
                (pendingAction === "transfer" && !targetCourseId)
              }
              onClick={handleConfirmAction}
            >
              {pendingAction === "change_batch"
                ? "Confirm Batch Change"
                : pendingAction === "transfer"
                  ? "Confirm Transfer"
                  : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
