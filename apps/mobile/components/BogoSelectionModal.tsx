import { useState, useEffect, useMemo } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { Id } from "@mindpoint/backend/data-model";
import { showRupees } from "@mindpoint/domain/pricing";
import { Gift, Sparkles } from "lucide-react-native";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const availableCourses = useQuery(
    api.courses.getBogoCoursesByType,
    isOpen
      ? ({
          courseType: courseType as
            | "certificate"
            | "internship"
            | "diploma"
            | "pre-recorded"
            | "masterclass"
            | "therapy"
            | "supervised"
            | "resume-studio",
        } as {
          courseType:
            | "certificate"
            | "internship"
            | "diploma"
            | "pre-recorded"
            | "masterclass"
            | "therapy"
            | "supervised"
            | "resume-studio";
        })
      : "skip",
  );

  const selectableCourses = useMemo(
    () =>
      availableCourses?.filter(
        (course: { _id: Id<"courses"> }) => course._id !== sourceCourseId,
      ) || [],
    [availableCourses, sourceCourseId],
  );

  useEffect(() => {
    if (selectableCourses.length > 0 && !selectedCourseId) {
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
      <Dialog open={isOpen} onClose={handleClose}>
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#4338ca" />
          <Text className="mt-4 text-sm text-muted-foreground">
            Loading BOGO options...
          </Text>
        </View>
      </Dialog>
    );
  }

  if (selectableCourses.length === 0) {
    return (
      <Dialog open={isOpen} onClose={handleClose}>
        <DialogHeader onClose={handleClose}>
          <DialogTitle>No Free Course Options Available</DialogTitle>
          <DialogDescription>
            {`There are no other ${courseType} courses available with BOGO offers.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onPress={handleClose}>
            <Text className="font-semibold text-primary-foreground">Close</Text>
          </Button>
        </DialogFooter>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogHeader onClose={handleClose}>
        <View className="flex-row items-center gap-2">
          <Gift size={20} color="#059669" />
          <DialogTitle>Choose Your Free Course</DialogTitle>
        </View>
        <DialogDescription>
          {`You're getting a free ${courseType} course with your purchase of ${sourceCourseName}!`}
        </DialogDescription>
      </DialogHeader>

      <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
        <View className="gap-3">
          {selectableCourses.map(
            (course: {
              _id: Id<"courses">;
              name: string;
              description?: string;
              price: number;
              type?: string;
              duration?: string;
            }) => {
              const isSelected = selectedCourseId === course._id;
              return (
                <Pressable
                  key={course._id}
                  onPress={() => setSelectedCourseId(course._id)}
                >
                  <Card
                    className={`border-2 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-border"
                    }`}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-3">
                        <Text className="text-base font-semibold text-card-foreground">
                          {course.name}
                        </Text>
                        {course.description && (
                          <Text
                            className="mt-1 text-sm text-muted-foreground"
                            numberOfLines={2}
                          >
                            {course.description}
                          </Text>
                        )}
                        <View className="mt-2 flex-row items-center gap-2">
                          <Text className="text-xs text-muted-foreground">
                            Type: {course.type || "Course"}
                          </Text>
                          {course.duration && (
                            <>
                              <Text className="text-xs text-muted-foreground">
                                {" \u2022 "}
                              </Text>
                              <Text className="text-xs text-muted-foreground">
                                Duration: {course.duration}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                      <View className="items-end gap-1">
                        <Badge className="bg-emerald-100">
                          <View className="flex-row items-center">
                            <Sparkles size={12} color="#059669" />
                            <Text className="ml-1 text-xs font-semibold text-emerald-800">
                              FREE
                            </Text>
                          </View>
                        </Badge>
                        <Text className="text-xs text-muted-foreground line-through">
                          {showRupees(course.price)}
                        </Text>
                        <Text className="text-sm font-semibold text-emerald-600">
                          {showRupees(0)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            },
          )}
        </View>
      </ScrollView>

      <DialogFooter>
        <Button variant="outline" onPress={handleClose}>
          <Text className="font-semibold text-foreground">Cancel</Text>
        </Button>
        <Button
          onPress={handleConfirm}
          disabled={!selectedCourseId}
          className="bg-emerald-600"
        >
          <View className="flex-row items-center">
            <Gift size={16} color="#ffffff" />
            <Text className="ml-2 font-semibold text-white">
              Add with Free Course
            </Text>
          </View>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
