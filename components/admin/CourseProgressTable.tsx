"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Download } from "lucide-react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CourseProgressTable({
  courseId,
}: {
  courseId: string;
}) {
  const id = courseId as Id<"courses">;
  const rows = useQuery(api.lms.getCourseProgressForAdmin, { courseId: id });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!rows) return [];
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(
      (row) =>
        (row.userName ?? "").toLowerCase().includes(query) ||
        (row.userEmail ?? "").toLowerCase().includes(query) ||
        (row.enrollmentNumber ?? "").toLowerCase().includes(query),
    );
  }, [rows, search]);

  function exportCsv() {
    const header = [
      "Name",
      "Email",
      "Enrollment",
      "Lessons completed",
      "Total lessons",
      "Quiz score",
      "Quiz passed",
      "Certificate code",
    ];
    const lines = filtered.map((row) => [
      row.userName ?? "",
      row.userEmail ?? "",
      row.enrollmentNumber ?? "",
      String(row.completedLessons),
      String(row.totalLessons),
      row.quizScore == null ? "" : String(row.quizScore),
      row.quizPassed ? "yes" : "no",
      row.certificateCode ?? "",
    ]);
    const csv = [header, ...lines]
      .map((cols) =>
        cols.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "course-progress.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (rows === undefined) {
    return <p className="text-sm text-slate-500">Loading progress…</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-3">
          <span>Learner progress ({rows.length})</span>
          <div className="flex items-center gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or enrollment"
              className="h-9 w-64"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={filtered.length === 0}
            >
              <Download className="mr-1 h-3.5 w-3.5" />
              CSV
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">
            No active enrollments yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
                  <th className="py-2 pr-4 font-medium">Learner</th>
                  <th className="py-2 pr-4 font-medium">Lessons</th>
                  <th className="py-2 pr-4 font-medium">Quiz</th>
                  <th className="py-2 pr-4 font-medium">Certificate</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const percent =
                    row.totalLessons > 0
                      ? Math.round(
                          (row.completedLessons / row.totalLessons) * 100,
                        )
                      : 0;
                  return (
                    <tr
                      key={row.userId}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium text-slate-900">
                          {row.userName ?? "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {row.userEmail ?? row.enrollmentNumber ?? ""}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="bg-secondary h-2 w-32 overflow-hidden rounded-full">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {row.completedLessons}/{row.totalLessons} · {percent}%
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {row.quizScore == null ? (
                          <span className="text-xs text-slate-400">
                            Not attempted
                          </span>
                        ) : (
                          <Badge
                            variant={row.quizPassed ? "default" : "secondary"}
                          >
                            {row.quizScore}%{" "}
                            {row.quizPassed ? "· Passed" : "· Not passed"}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {row.certificateCode ? (
                          <Link
                            href={`/verify/${row.certificateCode}`}
                            target="_blank"
                            className="text-primary text-xs font-medium underline"
                          >
                            {row.certificateCode}
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
