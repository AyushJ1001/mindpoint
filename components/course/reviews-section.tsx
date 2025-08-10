"use client";

import React from "react";
import { Star as StarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { StarRating } from "@/components/course/ratings";
import ReviewForm from "@/components/course/review-form";

type Review = { id: string; rating: number; content: string };

interface ReviewsSectionProps {
  reviews?: Review[];
}

export default function ReviewsSection({
  reviews = [
    {
      id: "r1",
      rating: 4.5,
      content: "Clear frameworks and supportive mentors.",
    },
    { id: "r2", rating: 5, content: "Loved the case studies and role-plays!" },
    {
      id: "r3",
      rating: 4.0,
      content: "Great intro for beginners. Journaling module was my favorite.",
    },
  ],
}: ReviewsSectionProps) {
  return (
    <section className="py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
            <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-3xl font-bold md:text-4xl">
                  Client Reviews
                </CardTitle>
                <CardDescription className="text-lg">
                  Hear from our successful clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {reviews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {reviews.map((review, idx) => (
                      <Card
                        key={review.id}
                        className="border-muted border-2 shadow-lg transition-shadow hover:shadow-xl"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-muted-foreground text-sm font-medium">
                              {review.rating.toFixed(1)} / 5
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed">
                            "{review.content}"
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <StarIcon className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                    <p className="text-muted-foreground text-lg">
                      No reviews yet - be the first!
                    </p>
                  </div>
                )}

                <div className="mx-auto max-w-2xl">
                  <ReviewForm />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
