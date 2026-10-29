"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@/lib/backend/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StudentDrawer } from "@/components/admin/StudentDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { hasLifetimeRecordings } from "@/lib/recording-entitlement";
import type { Id } from "@/lib/backend/data-model";

function monthLabel(startDate?: string) {
  if (!startDate) return "No batch";
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return "No batch";
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function paymentLabel(enrollment: {
  status?: string;
  paymentVerification?: string;
}) {
  // Verification state is a fact about the payment; it outranks a later status
  // change, so a rejected screenshot still reads "Rejected" rather than hiding
  // behind "Cancelled".
  if (enrollment.paymentVerification === "rejected") return "Rejected";
  if (enrollment.paymentVerification === "pending") return "Pending verification";
  if (enrollment.status === "cancelled") return "Cancelled";
  return "Paid";
}

/**
 * One batch, in full. Reads the same admin queries as the grouped list; adds
 * counts, faculty, certificate state and the recording entitlement. Read-only —
 * transfers, edits and certificate upload arrive in later phases.
 */
export default function BatchDetailPage() {
  const params = useParams<{ courseId: string; batchId: string }>();
  const courseId = params.courseId as Id<"courses">;
  const batchId = params.batchId as Id<"courseBatches">;
  const [search, setSearch] = useState("");
  const [openStudent, setOpenStudent] = useState<string | null>(null);

  const courses = useQuery(api.adminCourses.listCourses, { limit: 500 });
  const batches = useQuery(api.adminCourses.listCourseBatches, { courseId });
  const enrollments = useQuery(api.adminEnrollments.listEnrollments, {
    courseId,
    limit: 500,
  });
  const certificates = useQuery(
    api.lmsCourseContent.listCertificatesForCourse,
    { courseId },
  );

  const course = (courses ?? []).find((row) => String(row._id) === String(courseId));
  const batch = (batches ?? []).find((row) => String(row._id) === String(batchId));

  const batchRows = useMemo(
    () =>
      (enrollments ?? []).filter(
        (row) => String(row.batchId ?? "") === String(batchId),
      ),
    [enrollments, batchId],
  );

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return batchRows
      .filter((row) =>
        !needle
          ? true
          : [row.userName, row.userEmail, row.enrollmentNumber, row._id]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(needle)),
      );
  }, [enrollments, batchId, search]);

  const counts = useMemo(() => {
    const base = { paid: 0, pending: 0, cancelled: 0, other: 0 };
    for (const row of batchRows) {
      const label = paymentLabel(row);
      if (label === "Paid") base.paid += 1;
      else if (label === "Cancelled") base.cancelled += 1;
      else if (label === "Pending verification") base.pending += 1;
      else base.other += 1;
    }
    return base;
  }, [batchRows]);

  const certificateByEnrollment = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of certificates ?? []) {
      if (row.certificate) map.set(String(row.enrollmentId), row.certificate.fileName);
    }
    return map;
  }, [certificates]);

  if (
    courses === undefined ||
    batches === undefined ||
    enrollments === undefined ||
    certificates === undefined
  ) {
    return <p className="text-muted-foreground text-sm">Loading batch…</p>;
  }

  if (!course || !batch) {
    return (
      <div className="space-y-4">
        <p className="text-sm">That batch could not be found.</p>
        <Link href="/admin/enrollments/by-course" className="text-primary text-sm underline">
          Back to enrollments by course
        </Link>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <nav className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <Link href="/admin/enrollments/by-course" className="hover:underline">
          Enrollments by course
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{course.name}</span>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{monthLabel(batch.startDate)}</span>
      </nav>

      <AdminPageHeader
        title={`${course.name} · ${monthLabel(batch.startDate)}`}
        description={`${batch.startDate} to ${batch.endDate} · ${batch.daysOfWeek?.join(" & ") ?? "schedule to be set"} ${batch.startTime}–${batch.endTime} IST`}
      />

      {!batch.startDate ? (
        <p className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This cohort has no recorded start date, so it cannot be classified as
          current or previous. Add the start date to resolve it; students keep
          access in the meantime.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-5">
        {[
          ["Enrolled", batchRows.length],
          ["Paid", counts.paid],
          ["Pending", counts.pending],
          ["Cancelled", counts.cancelled],
          ["Other", counts.other],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs tracking-[0.12em] uppercase">
                {label}
              </p>
              <p className="font-display mt-1 text-2xl">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Students</CardTitle>
          <Badge variant="outline">{batch.lifecycleStatus ?? "published"}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or enrollment number"
              aria-label="Search students in this batch"
            />
          </div>

          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {batchRows.length === 0
                ? "No students in this batch yet."
                : "No students match that search."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="py-2 pr-3">Student</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Enrolled</th>
                    <th className="py-2 pr-3">Payment</th>
                    <th className="py-2 pr-3">Paid</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Recordings</th>
                    <th className="py-2">Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._id} className="border-border border-t">
                      <td className="py-2 pr-3">
                        <button
                          type="button"
                          className="text-primary underline-offset-4 hover:underline"
                          onClick={() => setOpenStudent(String(row._id))}
                        >
                          {row.userName ?? "—"}
                        </button>
                      </td>
                      <td className="py-2 pr-3">{row.userEmail ?? "—"}</td>
                      <td className="py-2 pr-3">
                        {new Date(row._creationTime).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant="outline">{paymentLabel(row)}</Badge>
                      </td>
                      <td className="py-2 pr-3">
                        {typeof row.amountPaid === "number"
                          ? `₹${row.amountPaid.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="py-2 pr-3">{row.status ?? "active"}</td>
                      <td className="py-2 pr-3">
                        {hasLifetimeRecordings(row) ? "Lifetime" : "—"}
                      </td>
                      <td className="py-2">
                        {certificateByEnrollment.get(String(row._id)) ?? "Not issued"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>

      {openStudent ? (
        <StudentDrawer
          enrollmentId={openStudent as Id<"enrollments">}
          certificateName={certificateByEnrollment.get(openStudent)}
          onClose={() => setOpenStudent(null)}
        />
      ) : null}

      <p className="text-muted-foreground text-xs">
        Amounts and statuses are read from the enrollment records. A missing
        certificate means none has been uploaded for that enrollment, not that
        one was refused.
      </p>
    </>
  );
}
