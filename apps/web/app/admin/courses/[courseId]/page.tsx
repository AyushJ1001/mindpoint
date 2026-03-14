"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CourseEditor } from "@/components/admin/CourseEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { showRupees } from "@/lib/utils";

export default function AdminEditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId as Id<"courses">;
  const [registrantSearch, setRegistrantSearch] = useState("");
  const [registrantStatus, setRegistrantStatus] = useState<
    "all" | "active" | "cancelled" | "transferred"
  >("all");

  const course = useQuery(api.adminCourses.getCourseById, { courseId });
  const transition = useMutation(api.adminCourses.transitionCourseLifecycle);
  const enrollments = useQuery(api.adminEnrollments.listEnrollments, {
    courseId,
    search: registrantSearch || undefined,
    status: registrantStatus === "all" ? undefined : registrantStatus,
    limit: 500,
  });

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
  const registrationRows = enrollments ?? [];
  const activeCount = registrationRows.filter(
    (row) => row.status === "active",
  ).length;
  const transferredCount = registrationRows.filter(
    (row) => row.status === "transferred",
  ).length;

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">
              Registrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              Active: <strong>{activeCount}</strong>
            </p>
            <p>
              Transferred: <strong>{transferredCount}</strong>
            </p>
            <p>
              Capacity: <strong>{course.capacity}</strong>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              Current price: <strong>{showRupees(course.price)}</strong>
            </p>
            <p>
              Discount offer: <strong>{course.offer?.name || "None"}</strong>
            </p>
            <p>
              BOGO:{" "}
              <strong>
                {course.bogo?.enabled ? course.bogo.label || "Enabled" : "Off"}
              </strong>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              State: <strong>{course.lifecycleStatus || "published"}</strong>
            </p>
            <p>
              Schedule:{" "}
              <strong>
                {course.startDate} to {course.endDate}
              </strong>
            </p>
            <p>
              Type: <strong>{course.type || "-"}</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      <CourseEditor key={editorKey} course={course} />

      <Card>
        <CardHeader>
          <CardTitle>Registered Learners</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Search by name, email, user ID, enrollment #"
              value={registrantSearch}
              onChange={(e) => setRegistrantSearch(e.target.value)}
            />
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={registrantStatus}
              onChange={(e) =>
                setRegistrantStatus(
                  e.target.value as
                    | "all"
                    | "active"
                    | "cancelled"
                    | "transferred",
                )
              }
            >
              <option value="all">All registration states</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="transferred">Transferred</option>
            </select>
            <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600">
              Open any enrollment to transfer, cancel, or resend the
              confirmation.
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
                <tr>
                  <th className="px-3 py-2">Learner</th>
                  <th className="px-3 py-2">Enrollment</th>
                  <th className="px-3 py-2">Paid</th>
                  <th className="px-3 py-2">Registered</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!enrollments ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-600" colSpan={5}>
                      Loading registrations...
                    </td>
                  </tr>
                ) : registrationRows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-600" colSpan={5}>
                      No registrations found for this course.
                    </td>
                  </tr>
                ) : (
                  registrationRows.map((row) => (
                    <tr key={row._id} className="border-t">
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-900">
                          {row.userName || row.userEmail || row.userId}
                        </p>
                        <p className="text-xs text-slate-600">
                          {row.userEmail || row.userId}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-900">
                          {row.enrollmentNumber}
                        </p>
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
                        {row.mindPointsRedeemed ? (
                          <p className="text-slate-500">
                            Redeemed {row.mindPointsRedeemed} pts
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {new Date(row._creationTime).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/enrollments/${row._id}`}>
                            Open
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
