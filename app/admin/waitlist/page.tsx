"use client";

import { useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@/lib/backend/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminTimeZone } from "@/components/admin/AdminTimeZoneProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search } from "lucide-react";

export const dynamic = "force-dynamic";

const COURSE_TYPES = [
  { value: "", label: "All types" },
  { value: "certificate", label: "Certificate" },
  { value: "internship", label: "Internship" },
  { value: "pre-recorded", label: "Intro (self-paced)" },
  { value: "therapy", label: "Therapy" },
] as const;

const DELIVERIES = [
  { value: "", label: "All formats" },
  { value: "live", label: "Live cohort" },
  { value: "self_paced", label: "Self-paced" },
] as const;

export default function AdminWaitlistPage() {
  const { formatTimestamp } = useAdminTimeZone();
  const [search, setSearch] = useState("");
  const [courseType, setCourseType] = useState("");
  const [delivery, setDelivery] = useState("");

  const data = useQuery(api.adminWaitlist.listWaitlistEntries, {
    search: search.trim() || undefined,
    courseType: (courseType || undefined) as
      | "certificate"
      | "internship"
      | "pre-recorded"
      | "therapy"
      | undefined,
    delivery: (delivery || undefined) as "live" | "self_paced" | undefined,
    limit: 200,
  });

  const entries = data?.entries ?? [];

  const exportCsv = () => {
    const header = [
      "fullName",
      "email",
      "whatsapp",
      "courseTitle",
      "courseType",
      "cohortLabel",
      "delivery",
      "source",
      "marketingConsent",
      "createdAt",
    ];
    const escape = (value: unknown) => {
      const text = value === undefined || value === null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };
    const lines = [
      header.join(","),
      ...entries.map((entry) =>
        [
          entry.fullName,
          entry.email,
          entry.whatsapp,
          entry.courseTitle,
          entry.courseType,
          entry.cohortLabel,
          entry.delivery,
          entry.source,
          entry.marketingConsent ? "yes" : "no",
          new Date(entry.createdAt).toISOString(),
        ]
          .map(escape)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mindpoint-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminPageHeader
        title="Early-bird waitlist"
        description="Pre-registrations captured while registration is paused. Contact each list when its course opens."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={exportCsv}
            disabled={entries.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, WhatsApp or course"
              className="pl-9"
            />
          </div>
          <select
            value={courseType}
            onChange={(e) => setCourseType(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            aria-label="Filter by course type"
          >
            {COURSE_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            aria-label="Filter by format"
          >
            {DELIVERIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {data === undefined ? (
        <p className="text-sm text-slate-500">Loading waitlist…</p>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No pre-registrations yet. They appear here as visitors join while
            registration is paused.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">WhatsApp</th>
                  <th className="py-3 pr-4 font-medium">Course</th>
                  <th className="py-3 pr-4 font-medium">Cohort</th>
                  <th className="py-3 pr-4 font-medium">Format</th>
                  <th className="py-3 pr-4 font-medium">Type</th>
                  <th className="py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry._id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {entry.fullName}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      <a
                        href={`mailto:${entry.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {entry.email}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      <a
                        href={`https://wa.me/${entry.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline"
                      >
                        {entry.whatsapp}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {entry.courseTitle}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {entry.cohortLabel ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {entry.delivery === "live" ? "Live cohort" : "Self-paced"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary">{entry.courseType}</Badge>
                    </td>
                    <td className="py-3 text-slate-600">
                      {formatTimestamp(entry.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.hasMore && (
              <p className="mt-4 text-xs text-slate-500">
                Showing the latest {entries.length}. Refine your filters to
                narrow the list.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
