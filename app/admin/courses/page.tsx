"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { downloadCsv, toCsv } from "@/lib/csv";

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [lifecycle, setLifecycle] = useState<
    "all" | "draft" | "published" | "archived"
  >("all");

  const courses = useQuery(api.adminCourses.listCourses, {
    search: search || undefined,
    lifecycleStatus: lifecycle === "all" ? undefined : lifecycle,
    limit: 500,
  });

  const rows = useMemo(() => courses ?? [], [courses]);

  const exportRows = useMemo(
    () =>
      rows.map((course) => ({
        id: course._id,
        name: course.name,
        type: course.type,
        lifecycleStatus: course.lifecycleStatus || "published",
        code: course.code,
        price: course.price,
        capacity: course.capacity,
        enrolledUsers: (course.enrolledUsers ?? []).length,
        startDate: course.startDate,
        endDate: course.endDate,
      })),
    [rows],
  );

  return (
    <div>
      <AdminPageHeader
        title="Courses"
        description="Manage all course catalog entries with lifecycle controls."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  `admin-courses-${new Date().toISOString().slice(0, 10)}.csv`,
                  toCsv(exportRows),
                )
              }
            >
              Export CSV
            </Button>
            <Button asChild>
              <Link href="/admin/courses/new">New Course</Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input
          placeholder="Search by name, code, type"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="h-10 rounded-md border bg-white px-3 text-sm"
          value={lifecycle}
          onChange={(e) =>
            setLifecycle(
              e.target.value as "all" | "draft" | "published" | "archived",
            )
          }
        >
          <option value="all">All lifecycle states</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Lifecycle</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Seats</th>
              <th className="px-3 py-2">Schedule</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!courses ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={7}>
                  Loading courses...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={7}>
                  No courses found.
                </td>
              </tr>
            ) : (
              rows.map((course) => (
                <tr key={course._id} className="border-t">
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {course.name}
                  </td>
                  <td className="px-3 py-2">{course.type || "-"}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">
                      {course.lifecycleStatus || "published"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">₹{Math.round(course.price)}</td>
                  <td className="px-3 py-2">
                    {(course.enrolledUsers || []).length}/{course.capacity}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {course.startDate} - {course.endDate}
                  </td>
                  <td className="px-3 py-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/courses/${course._id}`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
