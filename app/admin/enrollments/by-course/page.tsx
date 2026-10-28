"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@/lib/backend/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Id } from "@/lib/backend/data-model";

function monthLabel(startDate?: string) {
  if (!startDate) return "No batch";
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return "No batch";
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

type Enrollment = {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  courseId: string;
  courseName?: string;
  batchId?: string;
  batchLabel?: string;
  batchStartDate?: string;
  status?: string;
  amountPaid?: number;
  _creationTime: number;
};

/**
 * Enrollments grouped the way the team thinks about them: course, then batch,
 * then students. Read-only, built on the existing admin queries — no schema or
 * checkout change.
 */
export default function EnrollmentsByCoursePage() {
  const [search, setSearch] = useState("");
  const courses = useQuery(api.adminCourses.listCourses, { limit: 500 });
  const enrollments = useQuery(api.adminEnrollments.listEnrollments, {
    limit: 500,
  });

  const filtered = useMemo(() => {
    const rows = (enrollments ?? []) as Enrollment[];
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.userName, row.userEmail, row.courseName, row.batchLabel, row._id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [enrollments, search]);

  const byCourse = useMemo(() => {
    const map = new Map<string, Enrollment[]>();
    for (const row of filtered) {
      const list = map.get(row.courseId) ?? [];
      list.push(row);
      map.set(row.courseId, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Enrollments by course"
        description="Course → batch → students. Every existing batch appears under its course, newest first."
      />

      <div className="max-w-md">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search student, email, course or batch"
          aria-label="Search enrollments"
        />
      </div>

      {courses === undefined || enrollments === undefined ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <div className="space-y-6">
          {(courses as { _id: Id<"courses">; name: string }[])
            .filter((course) => (byCourse.get(String(course._id)) ?? []).length > 0)
            .map((course) => (
              <CourseGroup
                key={course._id}
                courseId={course._id}
                courseName={course.name}
                rows={byCourse.get(String(course._id)) ?? []}
              />
            ))}
          {byCourse.size === 0 ? (
            <p className="text-muted-foreground text-sm">
              No enrollments match that search.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function CourseGroup({
  courseId,
  courseName,
  rows,
}: {
  courseId: Id<"courses">;
  courseName: string;
  rows: Enrollment[];
}) {
  const batches = useQuery(api.adminCourses.listCourseBatches, { courseId });

  const groups = useMemo(() => {
    const byBatch = new Map<string, Enrollment[]>();
    for (const row of rows) {
      const key = row.batchId ? String(row.batchId) : "none";
      const list = byBatch.get(key) ?? [];
      list.push(row);
      byBatch.set(key, list);
    }

    const ordered = (batches ?? [])
      .map((batch) => ({
        id: String(batch._id),
        label: monthLabel(batch.startDate),
        startDate: batch.startDate,
        endDate: batch.endDate,
        students: byBatch.get(String(batch._id)) ?? [],
      }))
      .sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

    if (byBatch.has("none")) {
      ordered.push({
        id: "none",
        label: "No batch assigned",
        startDate: "",
        endDate: "",
        students: byBatch.get("none") ?? [],
      });
    }
    return ordered;
  }, [batches, rows]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 text-lg">
          <span>{courseName}</span>
          <span className="text-muted-foreground text-sm font-normal">
            {rows.length} enrollment{rows.length === 1 ? "" : "s"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {groups.map((group) => (
          <details
            key={group.id}
            className="border-border rounded border px-4 py-3"
            open={group.students.length > 0 && groups.length <= 2}
          >
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
              <span className="font-medium">
                {group.label}
                {group.startDate ? (
                  <span className="text-muted-foreground ml-2 text-xs font-normal">
                    starts {group.startDate}
                  </span>
                ) : null}
              </span>
              <Badge variant="outline">
                {group.students.length} student
                {group.students.length === 1 ? "" : "s"}
              </Badge>
            </summary>

            {group.students.length === 0 ? (
              <p className="text-muted-foreground mt-3 text-sm">
                No enrollments in this batch.
              </p>
            ) : (
              <table className="mt-3 w-full text-left text-sm">
                <thead className="text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="py-1 pr-3">Student</th>
                    <th className="py-1 pr-3">Email</th>
                    <th className="py-1 pr-3">Enrolled</th>
                    <th className="py-1 pr-3">Status</th>
                    <th className="py-1">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {group.students.map((student) => (
                    <tr key={student._id} className="border-border border-t">
                      <td className="py-2 pr-3">{student.userName ?? "—"}</td>
                      <td className="py-2 pr-3">{student.userEmail ?? "—"}</td>
                      <td className="py-2 pr-3">
                        {new Date(student._creationTime).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant="outline">{student.status ?? "active"}</Badge>
                      </td>
                      <td className="py-2">
                        {typeof student.amountPaid === "number"
                          ? `₹${student.amountPaid.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </details>
        ))}
      </CardContent>
    </Card>
  );
}
