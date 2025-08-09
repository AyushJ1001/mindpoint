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

export default function ReviewForm() {
  const form = useForm<{ rating: number; content: string }>({
    defaultValues: { rating: 5, content: "" },
  });
  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle>Leave a review</CardTitle>
        <CardDescription>
          Share your experience with this course.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              console.log("Review submitted", values);
              form.reset({ rating: 5, content: "" });
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
            <div className="flex justify-end">
              <Button type="submit">Submit review</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
