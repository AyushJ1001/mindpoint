"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCart } from "react-use-cart";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Plus,
  BookOpen,
  Award,
  Users,
  PlayCircle,
  Lightbulb,
  Heart,
  Eye,
  FileText,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { showRupees } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const CourseImageCarousel = ({ imageUrls }: { imageUrls: string[] }) => {
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="bg-muted relative flex h-72 items-center justify-center rounded-t-lg">
        <BookOpen className="text-muted-foreground h-12 w-12" />
      </div>
    );
  }

  if (imageUrls.length === 1) {
    return (
      <div className="bg-muted relative flex h-72 items-center justify-center overflow-hidden rounded-t-lg">
        <Image
          src={
            imageUrls[0] ??
            "https://blocks.astratic.com/img/general-img-landscape.png"
          }
          alt="Course image"
          className="max-h-full max-w-full object-contain"
          width={400}
          height={600}
        />
      </div>
    );
  }

  return (
    <div className="bg-muted relative h-72 overflow-hidden rounded-t-lg">
      <Carousel className="h-full w-full">
        <CarouselContent>
          {imageUrls.map((imageUrl, index) => (
            <CarouselItem
              key={index}
              className="flex h-72 items-center justify-center"
            >
              <Image
                src={imageUrl || ""}
                alt={`Course image ${index + 1}`}
                className="max-h-full max-w-full object-contain"
                width={400}
                height={600}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 transform rounded-full bg-black/50 text-white hover:bg-black/70" />
        <CarouselNext className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform rounded-full bg-black/50 text-white hover:bg-black/70" />
      </Carousel>
    </div>
  );
};

// Prefer explicit fields: `sessions` (number) or fallback to `duration` (string)
const extractVariantLabel = (course: Doc<"courses">): string | null => {
  if (typeof (course as any).sessions === "number") {
    const count = (course as any).sessions as number;
    return `${count} ${count === 1 ? "session" : "sessions"}`;
  }
  const duration = (course as any).duration as string | undefined;
  if (typeof duration === "string" && duration.trim().length > 0) {
    return duration.trim();
  }
  // Last resort: try to extract sessions from text
  const candidates = [course.name, course.description ?? "", course.content];
  for (const text of candidates) {
    if (!text) continue;
    const match = text.match(/(\d+)\s*(session|sessions)\b/i);
    if (match) {
      const count = Number(match[1]);
      return `${count} ${count === 1 ? "session" : "sessions"}`;
    }
  }
  return null;
};

const CourseGroupCard = ({ courses }: { courses: Array<Doc<"courses">> }) => {
  const { addItem, inCart } = useCart();
  const router = useRouter();
  const sorted = [...courses].sort((a, b) => a.price - b.price);
  // Use sessions-based selection when all variants have a numeric `sessions` field
  const useSessionsMode = sorted.every(
    (c) => typeof (c as any).sessions === "number",
  );
  // Otherwise, if all have a non-empty `duration` string, use duration-based select
  const useDurationMode =
    !useSessionsMode &&
    sorted.every(
      (c) => typeof (c as any).duration === "string" && !!(c as any).duration,
    );
  const [selectedId, setSelectedId] = React.useState(sorted[0]._id);
  const [selectedSessions, setSelectedSessions] = React.useState<number>(
    useSessionsMode ? ((sorted[0] as any).sessions as number) : 0,
  );
  const [selectedDuration, setSelectedDuration] = React.useState<string>(
    useDurationMode ? (((sorted[0] as any).duration as string) ?? "") : "",
  );
  const selectedCourse = useSessionsMode
    ? (sorted.find((c) => (c as any).sessions === selectedSessions) ??
      sorted[0])
    : useDurationMode
      ? (sorted.find((c) => (c as any).duration === selectedDuration) ??
        sorted[0])
      : (sorted.find((c) => c._id === selectedId) ?? sorted[0]);

  const handleAddToCart = () => {
    // Check if course is out of stock
    const seatsLeft = Math.max(
      0,
      (selectedCourse.capacity ?? 0) -
        (selectedCourse.enrolledUsers?.length ?? 0),
    );
    const isOutOfStock =
      (selectedCourse.capacity ?? 0) === 0 || seatsLeft === 0;

    if (isOutOfStock) {
      return; // Don't add to cart if out of stock
    }

    const label = extractVariantLabel(selectedCourse);
    addItem({
      id: selectedCourse._id,
      name: label ? `${selectedCourse.name} (${label})` : selectedCourse.name,
      description: selectedCourse.description,
      price: selectedCourse.price || 100,
      imageUrls: selectedCourse.imageUrls || [],
      capacity: selectedCourse.capacity || 1,
      quantity: 1, // Explicitly set initial quantity to 1
    });
  };

  const handleBuyNow = () => {
    if (!inCart(selectedCourse._id)) {
      handleAddToCart();
    }
    router.push("/cart");
  };

  const handleCardClick = () => {
    router.push(`/courses/${selectedCourse._id}`);
  };

  return (
    <Card
      className="card-shadow hover:card-shadow-lg transition-smooth group h-full cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <CourseImageCarousel imageUrls={selectedCourse.imageUrls || []} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="group-hover:text-primary transition-smooth text-lg">
              {sorted[0].name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-3">
          {useSessionsMode ? (
            <Select
              value={String(selectedSessions)}
              onValueChange={(val) => setSelectedSessions(parseInt(val, 10))}
            >
              <SelectTrigger
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue placeholder="Select sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sessions</SelectLabel>
                  {sorted.map((variant) => {
                    const sessions = (variant as any).sessions as number;
                    const label = `${sessions} ${sessions === 1 ? "session" : "sessions"}`;
                    return (
                      <SelectItem key={variant._id} value={String(sessions)}>
                        {label} — {showRupees(variant.price)}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : useDurationMode ? (
            <Select
              value={selectedDuration}
              onValueChange={(val) => setSelectedDuration(val)}
            >
              <SelectTrigger
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Duration</SelectLabel>
                  {sorted.map((variant) => {
                    const duration = (variant as any).duration as string;
                    const label = duration?.trim() ?? "Duration";
                    return (
                      <SelectItem key={variant._id} value={duration}>
                        {label} — {showRupees(variant.price)}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Select
              value={selectedId as unknown as string}
              onValueChange={(val) =>
                setSelectedId(val as unknown as Id<"courses">)
              }
            >
              <SelectTrigger
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Options</SelectLabel>
                  {sorted.map((variant, idx) => {
                    const extracted = extractVariantLabel(variant);
                    let label = extracted ?? `Option ${idx + 1}`;
                    // For therapy groups with exactly 3 variants, map to 3, 6, 8 sessions
                    const isTherapy =
                      (variant.type as string | undefined) === "therapy";
                    if (!extracted && isTherapy && sorted.length === 3) {
                      const mapped = [3, 6, 8][idx];
                      label = `${mapped} ${mapped === 1 ? "session" : "sessions"}`;
                    }
                    return (
                      <SelectItem
                        key={variant._id}
                        value={variant._id as unknown as string}
                      >
                        {label} — {showRupees(variant.price)}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-base font-semibold"
          >
            {showRupees(selectedCourse.price || 100)}
          </Badge>
          <div className="flex gap-2">
            {(() => {
              const seatsLeft = Math.max(
                0,
                (selectedCourse.capacity ?? 0) -
                  (selectedCourse.enrolledUsers?.length ?? 0),
              );
              const isOutOfStock =
                (selectedCourse.capacity ?? 0) === 0 || seatsLeft === 0;

              return (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  disabled={inCart(selectedCourse._id) || isOutOfStock}
                  size="sm"
                  className="transition-smooth"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isOutOfStock
                    ? "Out of Stock"
                    : inCart(selectedCourse._id)
                      ? "Added"
                      : "Add to Cart"}
                </Button>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CourseCard = ({ course }: { course: Doc<"courses"> }) => {
  const { addItem, inCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    // Check if course is out of stock
    const seatsLeft = Math.max(
      0,
      (course.capacity ?? 0) - (course.enrolledUsers?.length ?? 0),
    );
    const isOutOfStock = (course.capacity ?? 0) === 0 || seatsLeft === 0;

    if (isOutOfStock) {
      return; // Don't add to cart if out of stock
    }

    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: course.price || 100,
      imageUrls: course.imageUrls || [],
      capacity: course.capacity || 1,
      quantity: 1, // Explicitly set initial quantity to 1
    });
  };

  const handleBuyNow = () => {
    if (!inCart(course._id)) {
      handleAddToCart();
    }
    router.push("/cart");
  };

  const handleCardClick = () => {
    router.push(`/courses/${course._id}`);
  };

  return (
    <Card
      className="card-shadow hover:card-shadow-lg transition-smooth group h-full cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <CourseImageCarousel imageUrls={course.imageUrls || []} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="group-hover:text-primary transition-smooth text-lg">
              {course.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-base font-semibold"
          >
            {showRupees(course.price || 100)}
          </Badge>
          <div className="flex gap-2">
            {(() => {
              const seatsLeft = Math.max(
                0,
                (course.capacity ?? 0) - (course.enrolledUsers?.length ?? 0),
              );
              const isOutOfStock =
                (course.capacity ?? 0) === 0 || seatsLeft === 0;

              return (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  disabled={inCart(course._id) || isOutOfStock}
                  size="sm"
                  className="transition-smooth"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isOutOfStock
                    ? "Out of Stock"
                    : inCart(course._id)
                      ? "Added"
                      : "Add to Cart"}
                </Button>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const iconMap = {
  Award,
  Users,
  BookOpen,
  PlayCircle,
  Lightbulb,
  Heart,
  Eye,
  FileText,
};

interface CourseTypePageProps {
  courseType:
    | "certificate"
    | "internship"
    | "diploma"
    | "pre-recorded"
    | "masterclass"
    | "therapy"
    | "supervised"
    | "resume-studio";
  title: string;
  description: string;
  iconName: keyof typeof iconMap;
}

export default function CourseTypePage({
  courseType,
  title,
  description,
  iconName,
}: CourseTypePageProps) {
  const Icon = iconMap[iconName];
  const courses = useQuery(api.courses.listCoursesByType, { type: courseType });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding from-primary/5 via-background to-accent/5 bg-gradient-to-br">
        <div className="bg-[url('data:image/svg+xml;utf8,<svg ...>')] pointer-events-none absolute inset-0 bg-repeat opacity-20"></div>
        <div className="container text-center">
          <div className="mx-auto max-w-4xl">
            <div className="bg-primary/10 mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full">
              {Icon && <Icon className="text-primary h-10 w-10" />}
            </div>
            <div>
              <h1 className="from-foreground to-foreground/70 bg-gradient-to-b bg-clip-text font-serif text-4xl font-bold text-transparent uppercase">
                {title}
              </h1>
              <p className="text-muted-foreground mb-8 font-serif text-lg leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section>
        <div className="container">
          {courses?.courses && courses.courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                // Group courses by name; if multiple with same name, render a grouped card with select
                const nameToCourses = new Map<string, Array<Doc<"courses">>>();
                for (const course of courses.courses) {
                  const list = nameToCourses.get(course.name) ?? [];
                  list.push(course);
                  nameToCourses.set(course.name, list);
                }
                const groups = Array.from(nameToCourses.values());
                return groups.map((group) =>
                  group.length > 1 ? (
                    <CourseGroupCard key={group[0]._id} courses={group} />
                  ) : (
                    <CourseCard key={group[0]._id} course={group[0]} />
                  ),
                );
              })()}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-xl font-semibold">
                No courses available yet
              </h3>
              <p className="text-muted-foreground">
                We're working on adding new {title.toLowerCase()} courses. Check
                back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
