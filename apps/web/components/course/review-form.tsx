"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { InteractiveStarRating } from "@/components/course/ratings";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  courseId: Id<"courses">;
  editingReview?: Id<"reviews"> | null;
  onEditComplete?: () => void;
}

export default function ReviewForm({
  courseId,
  editingReview,
  onEditComplete,
}: ReviewFormProps) {
  const createReview = useMutation(api.courses.createReview);
  const updateReview = useMutation(api.courses.updateReview);
  const reviewToEdit = useQuery(
    api.courses.listReviewsForCourse,
    editingReview ? { courseId, count: 100 } : "skip",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<{ rating: number; content: string }>({
    defaultValues: { rating: 5, content: "" },
  });

  // Load review data when editing
  useEffect(() => {
    if (editingReview && reviewToEdit) {
      const review = reviewToEdit.find((r) => r._id === editingReview);
      if (review) {
        form.reset({
          rating: review.rating,
          content: review.content,
        });
      }
    } else if (!editingReview) {
      form.reset({ rating: 5, content: "" });
    }
  }, [editingReview, reviewToEdit, form]);

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle>
          {editingReview ? "Edit your review" : "Leave a review"}
        </CardTitle>
        <CardDescription>
          {editingReview
            ? "Update your review below."
            : "Share your experience with this course."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                setIsSubmitting(true);
                setSubmitError(null);
                setSubmitSuccess(false);

                if (editingReview) {
                  await updateReview({
                    reviewId: editingReview,
                    rating: values.rating,
                    content: values.content,
                  });
                  onEditComplete?.();
                } else {
                  await createReview({
                    courseId,
                    rating: values.rating,
                    content: values.content,
                  });
                }

                setSubmitSuccess(true);
                form.reset({ rating: 5, content: "" });

                // Clear success message after 3 seconds
                setTimeout(() => setSubmitSuccess(false), 3000);
              } catch (error) {
                console.error("Error submitting review:", error);
                setSubmitError(
                  error instanceof Error
                    ? error.message
                    : "Failed to submit review. Please try again.",
                );
              } finally {
                setIsSubmitting(false);
              }
            })}
          >
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <div className="flex items-center gap-2">
                    <InteractiveStarRating
                      rating={Number(field.value ?? 0)}
                      onRatingChange={field.onChange}
                    />
                    <span className="text-muted-foreground text-sm">
                      {Number(field.value ?? 0).toFixed(1)} / 5
                    </span>
                  </div>
                  <FormDescription>
                    Select a rating from 0.5 to 5.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What did you like?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {submitSuccess && (
              <div className="rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {editingReview
                  ? "Review updated successfully!"
                  : "Review submitted successfully! Thank you for your feedback."}
              </div>
            )}
            {submitError && (
              <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {submitError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              {editingReview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEditComplete?.()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? editingReview
                    ? "Updating..."
                    : "Submitting..."
                  : editingReview
                    ? "Update review"
                    : "Submit review"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
