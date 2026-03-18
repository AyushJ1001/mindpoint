"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { Id } from "@mindpoint/backend/data-model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { downloadCsv, toCsv } from "@/lib/csv";
import { isBogoActive, isDiscountActive, showRupees } from "@/lib/utils";
import { getUserFacingErrorMessage } from "@/lib/convex-error";
import { toast } from "sonner";

type CourseTypeFilter =
  | "all"
  | "certificate"
  | "internship"
  | "diploma"
  | "pre-recorded"
  | "masterclass"
  | "therapy"
  | "supervised"
  | "resume-studio"
  | "worksheet";

type OfferFilter = "all" | "discount" | "bogo" | "both" | "none";

const courseTypeOptions: CourseTypeFilter[] = [
  "all",
  "certificate",
  "internship",
  "diploma",
  "pre-recorded",
  "masterclass",
  "therapy",
  "supervised",
  "resume-studio",
  "worksheet",
];

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [lifecycle, setLifecycle] = useState<
    "all" | "draft" | "published" | "archived"
  >("all");
  const [courseType, setCourseType] = useState<CourseTypeFilter>("all");
  const [view, setView] = useState<"catalog" | "offers">("catalog");
  const [offerFilter, setOfferFilter] = useState<OfferFilter>("all");
  const [pendingTransition, setPendingTransition] = useState<{
    courseId: Id<"courses">;
    courseName: string;
    currentStatus: "draft" | "published" | "archived";
    nextStatus: "draft" | "published" | "archived";
  } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const courses = useQuery(api.adminCourses.listCourses, {
    search: search || undefined,
    lifecycleStatus: lifecycle === "all" ? undefined : lifecycle,
    type: courseType === "all" ? undefined : courseType,
    limit: 500,
  });
  const transitionCourse = useMutation(
    api.adminCourses.transitionCourseLifecycle,
  );

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

  const offerRows = useMemo(
    () =>
      rows.filter((course) => {
        const hasDiscount = !!course.offer;
        const hasBogo = !!course.bogo?.enabled;

        switch (offerFilter) {
          case "discount":
            return hasDiscount && !hasBogo;
          case "bogo":
            return hasBogo && !hasDiscount;
          case "both":
            return hasDiscount && hasBogo;
          case "none":
            return !hasDiscount && !hasBogo;
          default:
            return true;
        }
      }),
    [offerFilter, rows],
  );

  const confirmTransition = async () => {
    if (!pendingTransition) return;

    try {
      setIsTransitioning(true);
      await transitionCourse({
        courseId: pendingTransition.courseId,
        lifecycleStatus: pendingTransition.nextStatus,
      });
      toast.success(
        `"${pendingTransition.courseName}" moved to ${pendingTransition.nextStatus}`,
      );
      setPendingTransition(null);
    } catch (error) {
      toast.error(
        getUserFacingErrorMessage(error, "Failed to change course lifecycle"),
      );
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Courses"
        description="Manage the catalog, filter by course type, and review configured offers from one place."
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

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={view === "catalog" ? "default" : "outline"}
          onClick={() => setView("catalog")}
        >
          Catalog
        </Button>
        <Button
          variant={view === "offers" ? "default" : "outline"}
          onClick={() => setView("offers")}
        >
          Offers
        </Button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Input
          placeholder={
            view === "offers"
              ? "Search offers by course, code, type"
              : "Search by name, code, type"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="h-10 rounded-md border bg-white px-3 text-sm"
          value={courseType}
          onChange={(e) => setCourseType(e.target.value as CourseTypeFilter)}
        >
          {courseTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type === "all" ? "All course types" : type}
            </option>
          ))}
        </select>

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

        {view === "offers" ? (
          <select
            className="h-10 rounded-md border bg-white px-3 text-sm"
            value={offerFilter}
            onChange={(e) => setOfferFilter(e.target.value as OfferFilter)}
          >
            <option value="all">All offer varieties</option>
            <option value="discount">Discount only</option>
            <option value="bogo">BOGO only</option>
            <option value="both">Discount + BOGO</option>
            <option value="none">No offer configured</option>
          </select>
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600">
            Filter the catalog by lifecycle and course type.
          </div>
        )}
      </div>

      {view === "catalog" ? (
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
                    <td className="px-3 py-2">
                      {showRupees(Math.round(course.price))}
                    </td>
                    <td className="px-3 py-2">
                      {(course.enrolledUsers || []).length}/{course.capacity}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {course.startDate} - {course.endDate}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/courses/${course._id}`}>
                            Open
                          </Link>
                        </Button>
                        {(["draft", "published", "archived"] as const).map(
                          (nextStatus) => {
                            const currentStatus =
                              course.lifecycleStatus || "published";
                            const isCurrent = currentStatus === nextStatus;

                            return (
                              <Button
                                key={nextStatus}
                                variant={isCurrent ? "secondary" : "ghost"}
                                size="sm"
                                disabled={isTransitioning || isCurrent}
                                onClick={() =>
                                  setPendingTransition({
                                    courseId: course._id,
                                    courseName: course.name,
                                    currentStatus,
                                    nextStatus,
                                  })
                                }
                              >
                                {nextStatus === "published"
                                  ? "Publish"
                                  : nextStatus === "archived"
                                    ? "Archive"
                                    : "Draft"}
                              </Button>
                            );
                          },
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
              <tr>
                <th className="px-3 py-2">Course</th>
                <th className="px-3 py-2">Discount Offer</th>
                <th className="px-3 py-2">BOGO</th>
                <th className="px-3 py-2">Promotion State</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!courses ? (
                <tr>
                  <td className="px-3 py-4 text-slate-600" colSpan={5}>
                    Loading offers...
                  </td>
                </tr>
              ) : offerRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-600" colSpan={5}>
                    No courses matched this offer filter.
                  </td>
                </tr>
              ) : (
                offerRows.map((course) => {
                  const discountActive = isDiscountActive(course.offer);
                  const bogoActive = isBogoActive(course.bogo);

                  return (
                    <tr key={course._id} className="border-t">
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-900">
                          {course.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {course.type || "course"} • {course.code}
                        </p>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {course.offer ? (
                          <div className="space-y-1">
                            <p className="font-medium">{course.offer.name}</p>
                            <p>
                              {course.offer.discount ?? 0}% off •{" "}
                              {course.offer.startDate || "now"} to{" "}
                              {course.offer.endDate || "open"}
                            </p>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {course.bogo?.enabled ? (
                          <div className="space-y-1">
                            <p className="font-medium">
                              {course.bogo.label || "BOGO"}
                            </p>
                            <p>
                              {course.bogo.startDate || "now"} to{" "}
                              {course.bogo.endDate || "open"}
                            </p>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={discountActive ? "default" : "outline"}
                          >
                            {discountActive
                              ? "Discount active"
                              : "Discount idle"}
                          </Badge>
                          <Badge variant={bogoActive ? "default" : "outline"}>
                            {bogoActive ? "BOGO active" : "BOGO idle"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/courses/${course._id}`}>
                            Edit offer
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog
        open={pendingTransition !== null}
        onOpenChange={(open) => {
          if (!open && !isTransitioning) {
            setPendingTransition(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change course lifecycle?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingTransition
                ? `Move "${pendingTransition.courseName}" from ${pendingTransition.currentStatus} to ${pendingTransition.nextStatus}?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTransitioning}>
              Cancel
            </AlertDialogCancel>
            <Button
              disabled={isTransitioning}
              onClick={() => void confirmTransition()}
            >
              {isTransitioning ? "Updating..." : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
