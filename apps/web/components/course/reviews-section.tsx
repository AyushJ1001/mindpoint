"use client";

import React, { useState, useMemo } from "react";
import {
  Star as StarIcon,
  Edit2,
  Trash2,
  MoreVertical,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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

import { StarRating } from "@/components/course/ratings";
import ReviewForm from "@/components/course/review-form";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getRelativeTime } from "@/lib/time-utils";
import { useAuth } from "@clerk/nextjs";

interface ReviewsSectionProps {
  courseId: Id<"courses">;
  courseType?: string;
}

export default function ReviewsSection({
  courseId,
  courseType,
}: ReviewsSectionProps) {
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");
  const [visibleCount, setVisibleCount] = useState(6);

  const reviews = useQuery(api.courses.listReviewsForCourse, {
    courseId,
    sortBy,
  });
  const deleteReview = useMutation(api.courses.deleteReview);
  const { userId } = useAuth();
  const [editingReview, setEditingReview] = useState<Id<"reviews"> | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Id<"reviews"> | null>(
    null,
  );

  // Combine real reviews with placeholders if needed
  const allReviews = useMemo(() => {
    if (!reviews) return [];

    // If we have 3 or more real reviews, only show real reviews
    if (reviews.length >= 3) {
      return reviews;
    }

    // Placeholder reviews to show when there are few or no real reviews
    const placeholderReviews = [
      {
        _id: "placeholder-1" as Id<"reviews">,
        _creationTime: Date.now() - 86400000 * 7, // 7 days ago
        rating: 4.5,
        content: "Clear frameworks and supportive mentors.",
        userName: "Sarah M.",
        userId: "placeholder",
        course: courseId,
        isEdited: false,
      },
      {
        _id: "placeholder-2" as Id<"reviews">,
        _creationTime: Date.now() - 86400000 * 14, // 14 days ago
        rating: 5,
        content: "Loved the case studies and role-plays!",
        userName: "Michael R.",
        userId: "placeholder",
        course: courseId,
        isEdited: false,
      },
      {
        _id: "placeholder-3" as Id<"reviews">,
        _creationTime: Date.now() - 86400000 * 21, // 21 days ago
        rating: 4.0,
        content:
          "Great intro for beginners. Journaling module was my favorite.",
        userName: "Emma L.",
        userId: "placeholder",
        course: courseId,
        isEdited: false,
      },
    ];

    // If we have fewer than 3 real reviews, mix with placeholders
    const mixedReviews = [...reviews, ...placeholderReviews];

    // Sort the mixed reviews based on current sort preference
    if (sortBy === "rating") {
      mixedReviews.sort((a, b) => b.rating - a.rating);
    } else {
      mixedReviews.sort((a, b) => b._creationTime - a._creationTime);
    }

    return mixedReviews;
  }, [reviews, sortBy, courseId]);

  const displayedReviews = allReviews.slice(0, visibleCount);
  const hasMoreReviews = allReviews.length > visibleCount;

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteReview({ reviewId: reviewToDelete });
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const openDeleteDialog = (reviewId: Id<"reviews">) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };
  return (
    <section className="py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
            <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-3xl font-bold md:text-4xl">
                  <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                    {courseType === "certificate" || courseType === "internship"
                      ? "Student Reviews"
                      : "Client Reviews"}
                  </span>
                </CardTitle>
                <CardDescription className="text-lg">
                  {courseType === "certificate" || courseType === "internship"
                    ? "Hear from our successful students"
                    : "Hear from our successful clients"}
                </CardDescription>

                {/* Sorting Toggle */}
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortBy(sortBy === "date" ? "rating" : "date")
                    }
                    className="flex items-center gap-2"
                  >
                    {sortBy === "date" ? (
                      <>
                        <Calendar className="h-4 w-4" />
                        Latest
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4" />
                        Highest Rated
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {reviews === undefined ? (
                  <div className="py-12 text-center">
                    <div className="text-muted-foreground">
                      Loading reviews...
                    </div>
                  </div>
                ) : displayedReviews.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {displayedReviews.map((review) => {
                        const isOwner = userId && review.userId === userId;
                        const isAnonymous = review.userId === "anonymous";
                        const isPlaceholder = review.userId === "placeholder";
                        const canEdit =
                          isOwner && !isAnonymous && !isPlaceholder;

                        return (
                          <Card
                            key={review._id}
                            className="border-muted border-2 shadow-lg transition-shadow hover:shadow-xl"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <StarRating
                                    rating={review.rating}
                                    size="sm"
                                  />
                                  <span className="text-muted-foreground text-sm font-medium">
                                    {review.rating % 1 === 0
                                      ? review.rating.toString()
                                      : review.rating.toFixed(1)}{" "}
                                    / 5
                                  </span>
                                </div>
                                {canEdit && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setEditingReview(review._id)
                                        }
                                      >
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          openDeleteDialog(review._id)
                                        }
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-muted-foreground/70 text-xs">
                                  — {review.userName}
                                </p>
                                <p className="text-muted-foreground/50 text-xs">
                                  {getRelativeTime(review._creationTime)}
                                  {review.isEdited && " (edited)"}
                                </p>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground leading-relaxed">
                                {review.content}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {allReviews.length > 6 && (
                      <div className="flex justify-center gap-4">
                        {visibleCount > 6 && (
                          <Button
                            variant="outline"
                            onClick={() => setVisibleCount(6)}
                            className="flex items-center gap-2"
                          >
                            <ChevronUp className="h-4 w-4" />
                            Show Less
                          </Button>
                        )}
                        {hasMoreReviews && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              setVisibleCount((prev) =>
                                Math.min(prev + 6, allReviews.length),
                              )
                            }
                            className="flex items-center gap-2"
                          >
                            Show More
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <StarIcon className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                    <p className="text-muted-foreground text-lg">
                      No reviews yet - be the first!
                    </p>
                  </div>
                )}

                <div className="mx-auto max-w-2xl">
                  <ReviewForm
                    courseId={courseId}
                    editingReview={editingReview}
                    onEditComplete={() => setEditingReview(null)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
