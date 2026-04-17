"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { Id } from "@mindpoint/backend/data-model";
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
  onSelect: (selection: {
    batchId?: Id<"courseBatches">;
    batchLabel?: string;
    courseId: Id<"courses">;
  }) => void;
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
  const [selectedBatchId, setSelectedBatchId] =
    useState<Id<"courseBatches"> | null>(null);

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
  const selectedCourse = useMemo(
    () =>
      selectableCourses.find((course) => course._id === selectedCourseId) ||
      null,
    [selectableCourses, selectedCourseId],
  );
  const selectedCourseBatches = useQuery(
    api.courses.listCourseBatchesForCourse,
    selectedCourse?.usesBatches
      ? { courseId: selectedCourse._id }
      : "skip",
  );
  const availableBatches = useMemo(
    () => selectedCourseBatches || [],
    [selectedCourseBatches],
  );

  useEffect(() => {
    if (selectableCourses.length > 0 && !selectedCourseId) {
      // Auto-select the first course if only one option
      if (selectableCourses.length === 1) {
        setSelectedCourseId(selectableCourses[0]._id);
      }
    }
  }, [selectableCourses, selectedCourseId]);

  useEffect(() => {
    setSelectedBatchId(null);
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedCourse?.usesBatches) {
      return;
    }

    const firstOpenBatch = availableBatches.find(
      (batch) => batch.availabilityStatus === "upcoming_open",
    );
    if (firstOpenBatch && !selectedBatchId) {
      setSelectedBatchId(firstOpenBatch._id);
    }
  }, [availableBatches, selectedBatchId, selectedCourse?.usesBatches]);

  const handleConfirm = () => {
    if (selectedCourseId) {
      const batch = availableBatches.find(
        (candidate) => candidate._id === selectedBatchId,
      );
      onSelect({
        batchId: batch?._id,
        batchLabel: batch?.label,
        courseId: selectedCourseId,
      });
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedCourseId(null);
    setSelectedBatchId(null);
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

          {selectedCourse?.usesBatches ? (
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div>
                <h3 className="text-sm font-semibold">Choose batch</h3>
                <p className="text-muted-foreground text-xs">
                  The free course is added only after you pick its batch.
                </p>
              </div>
              <RadioGroup
                value={selectedBatchId || ""}
                onValueChange={(value) =>
                  setSelectedBatchId(value as Id<"courseBatches">)
                }
                className="space-y-2"
              >
                {availableBatches.map((batch) => {
                  const disabled =
                    batch.availabilityStatus !== "upcoming_open";
                  return (
                    <Label
                      key={batch._id}
                      htmlFor={batch._id}
                      className={`flex cursor-pointer items-center justify-between rounded-md border p-3 ${
                        disabled ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value={batch._id}
                          id={batch._id}
                          disabled={disabled}
                        />
                        <div>
                          <p className="text-sm font-medium">{batch.label}</p>
                          <p className="text-muted-foreground text-xs">
                            {[batch.startDate, batch.startTime]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                      </div>
                      <Badge variant={disabled ? "secondary" : "outline"}>
                        {batch.availabilityStatus === "upcoming_open"
                          ? "Open"
                          : batch.availabilityStatus === "upcoming_full"
                            ? "Full"
                            : "Closed"}
                      </Badge>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedCourseId || (selectedCourse?.usesBatches && !selectedBatchId)}
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
