"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { Doc, Id } from "@mindpoint/backend/data-model";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminTimeZone } from "@/components/admin/AdminTimeZoneProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getUserFacingErrorMessage } from "@/lib/convex-error";

type ReviewRow = {
  _id: Id<"reviews">;
  _creationTime: number;
  course: Id<"courses">;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  isEdited?: boolean;
  courseName: string;
  courseCode: string;
  courseType: string | null;
};

type ReviewFormState = {
  courseId: string;
  userName: string;
  userId: string;
  rating: string;
  content: string;
};

const emptyFormState: ReviewFormState = {
  courseId: "",
  userName: "",
  userId: "",
  rating: "5",
  content: "",
};

export default function AdminReviewsPage() {
  const searchParams = useSearchParams();
  const preselectedCourseId = searchParams.get("courseId") ?? "all";

  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(preselectedCourseId);
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rating">(
    "newest",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewRow | null>(null);
  const [formState, setFormState] = useState<ReviewFormState>(emptyFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { timeZoneLabel, formatTimestamp } = useAdminTimeZone();

  useEffect(() => {
    setSelectedCourseId(preselectedCourseId);
  }, [preselectedCourseId]);

  const courses = useQuery(api.adminCourses.listCourses, {
    limit: 500,
    sortBy: "name",
    sortOrder: "asc",
  }) as Doc<"courses">[] | undefined;

  const reviews = useQuery(api.adminReviews.listReviews, {
    search: search || undefined,
    courseId:
      selectedCourseId !== "all"
        ? (selectedCourseId as Id<"courses">)
        : undefined,
    rating: selectedRating !== "all" ? Number(selectedRating) : undefined,
    sortBy,
    limit: 500,
  }) as ReviewRow[] | undefined;

  const createReview = useMutation(api.adminReviews.createReview);
  const updateReview = useMutation(api.adminReviews.updateReview);
  const deleteReview = useMutation(api.adminReviews.deleteReview);

  const rows = reviews ?? [];
  const averageRating =
    rows.length > 0
      ? (
          rows.reduce((total, review) => total + review.rating, 0) / rows.length
        ).toFixed(1)
      : "0.0";

  const courseOptions = useMemo(() => courses ?? [], [courses]);

  const resetForm = () => {
    setEditingReview(null);
    setFormState({
      ...emptyFormState,
      courseId:
        selectedCourseId !== "all"
          ? selectedCourseId
          : courseOptions[0]?._id
            ? String(courseOptions[0]._id)
            : "",
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (review: ReviewRow) => {
    setEditingReview(review);
    setFormState({
      courseId: String(review.course),
      userName: review.userName,
      userId: review.userId.startsWith("admin-managed:") ? "" : review.userId,
      rating: String(review.rating),
      content: review.content,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const numericRating = Number(formState.rating);

    if (!formState.courseId) {
      toast.error("Select a course for this review");
      return;
    }

    try {
      setIsSaving(true);

      if (editingReview) {
        await updateReview({
          reviewId: editingReview._id,
          courseId: formState.courseId as Id<"courses">,
          userName: formState.userName,
          userId: formState.userId || undefined,
          rating: numericRating,
          content: formState.content,
        });
        toast.success("Review updated");
      } else {
        await createReview({
          courseId: formState.courseId as Id<"courses">,
          userName: formState.userName,
          userId: formState.userId || undefined,
          rating: numericRating,
          content: formState.content,
        });
        toast.success("Review created");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, "Failed to save review"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReviewId) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteReview({ reviewId: deleteReviewId as Id<"reviews"> });
      toast.success("Review deleted");
      setDeleteReviewId(null);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, "Failed to delete review"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reviews"
        description="Manage course reviews across the catalog and see review timestamps in your selected admin time zone."
        actions={<Button onClick={openCreateDialog}>Add Review</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">
              Visible Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">
              {rows.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">
              {averageRating}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">
              Working Time Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-slate-900">
              {timeZoneLabel}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Review timestamps on this page follow the selector in the admin
              header.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_240px_180px_180px]">
            <Input
              placeholder="Search by reviewer, content, course, code"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
            >
              <option value="all">All courses</option>
              {courseOptions.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={selectedRating}
              onChange={(event) => setSelectedRating(event.target.value)}
            >
              <option value="all">All ratings</option>
              <option value="5">5.0</option>
              <option value="4.5">4.5</option>
              <option value="4">4.0</option>
              <option value="3.5">3.5</option>
              <option value="3">3.0</option>
              <option value="2.5">2.5</option>
              <option value="2">2.0</option>
              <option value="1.5">1.5</option>
              <option value="1">1.0</option>
              <option value="0.5">0.5</option>
            </select>

            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as "newest" | "oldest" | "rating")
              }
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
                <tr>
                  <th className="px-3 py-2">Course</th>
                  <th className="px-3 py-2">Reviewer</th>
                  <th className="px-3 py-2">Rating</th>
                  <th className="px-3 py-2">Review</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews === undefined ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-600" colSpan={6}>
                      Loading reviews...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-600" colSpan={6}>
                      No reviews matched the current filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((review) => (
                    <tr key={review._id} className="border-t align-top">
                      <td className="px-3 py-3">
                        <p className="font-medium text-slate-900">
                          {review.courseName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {review.courseCode}
                          {review.courseType ? ` • ${review.courseType}` : ""}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-slate-900">
                          {review.userName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {review.userId}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">
                          {review.rating.toFixed(1)} / 5
                        </Badge>
                      </td>
                      <td className="max-w-md px-3 py-3 text-slate-700">
                        <p>{review.content}</p>
                        {review.isEdited ? (
                          <p className="mt-1 text-xs text-amber-700">Edited</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500">
                        {formatTimestamp(review._creationTime)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(review)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setDeleteReviewId(String(review._id))
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingReview ? "Edit Review" : "Add Review"}
            </DialogTitle>
            <DialogDescription>
              Create or update a course review. Ratings accept 0.5 increments.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Course</Label>
              <select
                className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                value={formState.courseId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    courseId: event.target.value,
                  }))
                }
              >
                <option value="">Select a course</option>
                {courseOptions.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Reviewer Name</Label>
              <Input
                value={formState.userName}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    userName: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Reviewer ID</Label>
              <Input
                placeholder="Optional. Defaults to admin-managed."
                value={formState.userId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    userId: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <Input
                type="number"
                min={0.5}
                max={5}
                step={0.5}
                value={formState.rating}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    rating: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Review Content</Label>
            <Textarea
              rows={6}
              value={formState.content}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button disabled={isSaving} onClick={() => void handleSave()}>
              {isSaving
                ? "Saving..."
                : editingReview
                  ? "Update Review"
                  : "Create Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteReviewId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteReviewId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the selected review from the course and the public
              course page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete Review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
