"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { showRupees } from "@/lib/utils";
import { Gift, Sparkles } from "lucide-react";

interface BogoSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (courseId: Id<"courses">) => void;
  courseType:
    | "certificate"
    | "internship"
    | "diploma"
    | "pre-recorded"
    | "masterclass"
    | "therapy"
    | "supervised"
    | "resume-studio"
    | "worksheet";
  sourceCourseId: Id<"courses">;
  sourceCourseName: string;
}

export function BogoSelectionModal({
  isOpen,
  onClose,
  onSelect,
  courseType,
  sourceCourseId,
  sourceCourseName,
}: BogoSelectionModalProps) {
  const [selectedCourseId, setSelectedCourseId] =
    useState<Id<"courses"> | null>(null);

  const availableCourses = useQuery(api.courses.getBogoCoursesByType, {
    courseType: courseType as
      | "certificate"
      | "internship"
      | "diploma"
      | "pre-recorded"
      | "masterclass"
      | "therapy"
      | "supervised"
      | "resume-studio",
  } as
    | {
        courseType:
          | "certificate"
          | "internship"
          | "diploma"
          | "pre-recorded"
          | "masterclass"
          | "therapy"
          | "supervised"
          | "resume-studio";
      }
    | "skip");

  // Filter out the source course from available options
  const selectableCourses = useMemo(
    () =>
      availableCourses?.filter((course) => course._id !== sourceCourseId) || [],
    [availableCourses, sourceCourseId],
  );

  useEffect(() => {
    if (selectableCourses.length > 0 && !selectedCourseId) {
      // Auto-select the first course if only one option
      if (selectableCourses.length === 1) {
        setSelectedCourseId(selectableCourses[0]._id);
      }
    }
  }, [selectableCourses, selectedCourseId]);

  const handleConfirm = () => {
    if (selectedCourseId) {
      onSelect(selectedCourseId);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedCourseId(null);
    onClose();
  };

  if (!availableCourses) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading BOGO Options...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (selectableCourses.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No Free Course Options Available</DialogTitle>
            <DialogDescription>
              There are no other {courseType} courses available with BOGO
              offers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-emerald-600" />
            Choose Your Free Course
          </DialogTitle>
          <DialogDescription>
            You&apos;re getting a free {courseType} course with your purchase of{" "}
            <strong>{sourceCourseName}</strong>! Select which {courseType}{" "}
            course you&apos;d like to get for free:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={selectedCourseId || ""}
            onValueChange={(value) =>
              setSelectedCourseId(value as Id<"courses">)
            }
            className="space-y-3"
          >
            {selectableCourses.map((course) => (
              <div key={course._id} className="relative">
                <Label htmlFor={course._id} className="cursor-pointer">
                  <Card className="border-2 transition-all hover:shadow-md data-[state=checked]:border-emerald-500 data-[state=checked]:ring-2 data-[state=checked]:ring-emerald-200">
                    <div className="flex items-start gap-4 p-4">
                      <RadioGroupItem
                        value={course._id}
                        id={course._id}
                        className="mt-1"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold">
                              {course.name}
                            </CardTitle>
                            {course.description && (
                              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                {course.description}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">
                              <Sparkles className="mr-1 h-3 w-3" />
                              FREE
                            </Badge>
                            <div className="text-right">
                              <div className="text-muted-foreground text-sm line-through">
                                {showRupees(course.price)}
                              </div>
                              <div className="font-semibold text-emerald-600">
                                {showRupees(0)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span>Type: {course.type || "Course"}</span>
                          {course.duration && (
                            <>
                              <span>•</span>
                              <span>Duration: {course.duration}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedCourseId}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Gift className="mr-2 h-4 w-4" />
            Add to Cart with Free Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
