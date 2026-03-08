"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { downloadCsv, toCsv } from "@/lib/csv";
import { showRupees } from "@/lib/utils";

export default function AdminEnrollmentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "active" | "cancelled" | "transferred"
  >("all");
  const [resendingEnrollmentId, setResendingEnrollmentId] = useState<
    string | null
  >(null);
  const [cancelEnrollmentId, setCancelEnrollmentId] = useState<string | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState("Cancelled by admin");

  const [manualUserId, setManualUserId] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualCourseId, setManualCourseId] = useState("");
  const [manualInternshipPlan, setManualInternshipPlan] = useState<
    "" | "120" | "240"
  >("");
  const [isCreatingEnrollment, setIsCreatingEnrollment] = useState(false);
  const manualUserIdLooksLikeEmail = manualUserId.includes("@");

  const enrollments = useQuery(api.adminEnrollments.listEnrollments, {
    search: search || undefined,
    status: status === "all" ? undefined : status,
    limit: 500,
  });

  const courses = useQuery(api.adminCourses.listCourses, { limit: 500 });

  const createManualEnrollment = useMutation(
    api.adminEnrollments.createManualEnrollment,
  );
  const cancelEnrollment = useMutation(api.adminEnrollments.cancelEnrollment);
  const resendEnrollmentEmail = useMutation(
    api.adminEnrollments.resendEnrollmentConfirmationEmail,
  );

  const rows = useMemo(() => enrollments ?? [], [enrollments]);
  const selectedManualCourse = useMemo(
    () =>
      (courses || []).find((course) => String(course._id) === manualCourseId),
    [courses, manualCourseId],
  );

  const exportRows = useMemo(
    () =>
      rows.map((row) => ({
        id: row._id,
        userId: row.userId,
        userName: row.userName,
        userEmail: row.userEmail,
        courseName: row.courseName,
        enrollmentNumber: row.enrollmentNumber,
        status: row.status,
        amountPaid: row.amountPaid ?? row.checkoutPrice ?? 0,
        mindPointsRedeemed: row.mindPointsRedeemed ?? 0,
        couponCode: row.couponCode ?? "",
        registeredAt: new Date(row._creationTime).toISOString(),
      })),
    [rows],
  );

  const handleManualCreate = async () => {
    if (isCreatingEnrollment) {
      return;
    }

    if (!manualCourseId || !manualEmail || !manualUserId) {
      toast.error("userId, email and course are required");
      return;
    }

    if (selectedManualCourse?.type === "internship" && !manualInternshipPlan) {
      toast.error("Select internship hours before creating the enrollment");
      return;
    }

    if (
      manualUserIdLooksLikeEmail &&
      manualUserId.trim().toLowerCase() !== manualEmail.trim().toLowerCase()
    ) {
      toast.error(
        "For guest users, the User ID and User Email fields must match.",
      );
      return;
    }
    setIsCreatingEnrollment(true);
    try {
      await createManualEnrollment({
        userId: manualUserId,
        userEmail: manualEmail,
        userName: manualName || undefined,
        userPhone: manualPhone || undefined,
        courseId: manualCourseId as Id<"courses">,
        isGuestUser: manualUserIdLooksLikeEmail,
        internshipPlan:
          selectedManualCourse?.type === "internship"
            ? manualInternshipPlan === "120" || manualInternshipPlan === "240"
              ? manualInternshipPlan
              : undefined
            : undefined,
      });
      toast.success("Manual enrollment created");
      setManualUserId("");
      setManualEmail("");
      setManualName("");
      setManualPhone("");
      setManualCourseId("");
      setManualInternshipPlan("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create enrollment",
      );
    } finally {
      setIsCreatingEnrollment(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelEnrollmentId) return;
    try {
      await cancelEnrollment({
        enrollmentId: cancelEnrollmentId as Id<"enrollments">,
        reason: cancelReason.trim(),
      });
      toast.success("Enrollment cancelled");
      setCancelEnrollmentId(null);
      setCancelReason("Cancelled by admin");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel enrollment",
      );
    }
  };

  const handleResendEmail = async (enrollmentId: string) => {
    setResendingEnrollmentId(enrollmentId);
    try {
      await resendEnrollmentEmail({
        enrollmentId: enrollmentId as Id<"enrollments">,
      });
      toast.success("Enrollment email sent");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send enrollment email",
      );
    } finally {
      setResendingEnrollmentId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Enrollments"
        description="Run manual enrollments, cancellations, and monitor transfer/cancel status."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              downloadCsv(
                `admin-enrollments-${new Date().toISOString().slice(0, 10)}.csv`,
                toCsv(exportRows),
              )
            }
          >
            Export CSV
          </Button>
        }
      />

      <div className="mb-6 rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Manual Enrollment
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="User ID (Clerk ID or guest email)"
            value={manualUserId}
            onChange={(e) => {
              const val = e.target.value;
              setManualUserId(val);
              if (val.includes("@")) {
                setManualEmail(val);
              }
            }}
          />
          <Input
            placeholder="User Email"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            disabled={manualUserIdLooksLikeEmail}
          />
          <Input
            placeholder="User Name"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
          />
          <Input
            placeholder="Phone"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
          />
          <select
            className="h-10 rounded-md border bg-white px-3 text-sm"
            value={manualCourseId}
            onChange={(e) => {
              const nextCourseId = e.target.value;
              setManualCourseId(nextCourseId);
              const nextCourse = (courses || []).find(
                (course) => String(course._id) === nextCourseId,
              );
              if (nextCourse?.type !== "internship") {
                setManualInternshipPlan("");
              }
            }}
          >
            <option value="">Select course</option>
            {(courses || []).map((course) => (
              <option key={course._id} value={course._id}>
                {course.name} ({course.type})
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={manualUserIdLooksLikeEmail}
              disabled
              readOnly
            />
            Treat as guest user
          </label>
          {selectedManualCourse?.type === "internship" ? (
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={manualInternshipPlan}
              onChange={(e) =>
                setManualInternshipPlan(e.target.value as "" | "120" | "240")
              }
            >
              <option value="">Select internship hours</option>
              <option value="120">120 hours</option>
              <option value="240">240 hours</option>
            </select>
          ) : null}
        </div>
        <div className="mt-3">
          <Button
            onClick={handleManualCreate}
            disabled={
              isCreatingEnrollment ||
              !manualCourseId ||
              !manualEmail ||
              !manualUserId ||
              (selectedManualCourse?.type === "internship" &&
                !manualInternshipPlan)
            }
          >
            {isCreatingEnrollment ? "Creating..." : "Create Enrollment"}
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input
          placeholder="Search user, email, enrollment #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-md border bg-white px-3 text-sm"
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value as "all" | "active" | "cancelled" | "transferred",
            )
          }
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="transferred">Transferred</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Course</th>
              <th className="px-3 py-2">Enrollment #</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Paid</th>
              <th className="px-3 py-2">Mind Points</th>
              <th className="px-3 py-2">Registered</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!enrollments ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={8}>
                  Loading enrollments...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={8}>
                  No enrollments found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id} className="border-t">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">
                      {row.userName || row.userId}
                    </p>
                    <p className="text-xs text-slate-600">
                      {row.userEmail || row.userId}
                    </p>
                  </td>
                  <td className="px-3 py-2">{row.courseName || "-"}</td>
                  <td className="px-3 py-2">{row.enrollmentNumber}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{row.status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    <p>
                      {row.amountPaid != null
                        ? showRupees(row.amountPaid)
                        : row.checkoutPrice != null
                          ? showRupees(row.checkoutPrice)
                          : "—"}
                    </p>
                    {typeof row.amountPaid === "number" &&
                    typeof row.checkoutPrice === "number" &&
                    row.checkoutPrice !== row.amountPaid ? (
                      <p className="text-slate-500">
                        from {showRupees(row.checkoutPrice)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {row.mindPointsRedeemed ? (
                      <>
                        <p>{row.mindPointsRedeemed} pts</p>
                        {row.couponCode ? (
                          <p className="text-slate-500">{row.couponCode}</p>
                        ) : null}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {new Date(row._creationTime).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/enrollments/${row._id}`}>View</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          row.status !== "active" ||
                          resendingEnrollmentId === String(row._id)
                        }
                        onClick={() => handleResendEmail(String(row._id))}
                      >
                        {resendingEnrollmentId === String(row._id)
                          ? "Sending..."
                          : "Resend Email"}
                      </Button>
                      {row.status === "active" ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setCancelEnrollmentId(String(row._id))}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!cancelEnrollmentId}
        onOpenChange={(open) => {
          if (!open) {
            setCancelEnrollmentId(null);
            setCancelReason("Cancelled by admin");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Enrollment</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Enter a cancellation reason for this enrollment.
            </p>
            <Input
              placeholder="Cancellation reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelEnrollmentId(null);
                setCancelReason("Cancelled by admin");
              }}
            >
              Keep Enrollment
            </Button>
            <Button
              variant="destructive"
              disabled={!cancelEnrollmentId || !cancelReason.trim()}
              onClick={handleCancel}
            >
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
