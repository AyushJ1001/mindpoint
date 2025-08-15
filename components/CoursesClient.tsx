"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCart } from "react-use-cart";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { Id } from "@/convex/_generated/dataModel";

// Type for courses with sessions (therapy)
interface TherapyCourse extends Doc<"courses"> {
  sessions?: number;
}

// Type for courses with duration (internship)
interface InternshipCourse extends Doc<"courses"> {
  duration?: string;
}
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Plus } from "lucide-react";
import { showRupees } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CourseImageCarousel = ({ imageUrls }: { imageUrls: string[] }) => {
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="bg-muted relative flex h-80 items-center justify-center rounded-t-lg">
        <BookOpen className="text-muted-foreground h-12 w-12" />
      </div>
    );
  }

  if (imageUrls.length === 1) {
    return (
      <div className="bg-muted relative flex h-80 items-center justify-center overflow-hidden rounded-t-lg">
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
    <div className="bg-muted relative h-80 overflow-hidden rounded-t-lg">
      <Carousel className="h-full w-full">
        <CarouselContent>
          {imageUrls.map((imageUrl, index) => (
            <CarouselItem
              key={index}
              className="flex h-80 items-center justify-center"
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

// Prefer explicit fields: `sessions` (number) or fallback to `duration` (string) for label
const extractVariantLabel = (course: Doc<"courses">): string | null => {
  if (typeof (course as TherapyCourse).sessions === "number") {
    const count = (course as TherapyCourse).sessions ?? 0;
    return `${count} ${count === 1 ? "session" : "sessions"}`;
  }
  const duration = (course as InternshipCourse).duration;
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
  const useSessionsMode = sorted.every(
    (c) => typeof (c as TherapyCourse).sessions === "number",
  );
  const useDurationMode =
    !useSessionsMode &&
    sorted.every(
      (c) =>
        typeof (c as InternshipCourse).duration === "string" &&
        !!(c as InternshipCourse).duration,
    );
  const [selectedId, setSelectedId] = React.useState(sorted[0]._id);
  const [selectedSessions, setSelectedSessions] = React.useState<number>(
    useSessionsMode ? ((sorted[0] as TherapyCourse).sessions ?? 0) : 0,
  );
  const [selectedDuration, setSelectedDuration] = React.useState<string>(
    useDurationMode ? ((sorted[0] as InternshipCourse).duration ?? "") : "",
  );
  const selectedCourse = useSessionsMode
    ? (sorted.find((c) => (c as TherapyCourse).sessions === selectedSessions) ??
      sorted[0])
    : useDurationMode
      ? (sorted.find(
          (c) => (c as InternshipCourse).duration === selectedDuration,
        ) ?? sorted[0])
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
                    const sessions = (variant as TherapyCourse).sessions ?? 0;
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
                    const duration =
                      (variant as InternshipCourse).duration ?? "";
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

  const handleCardClick = () => {
    router.push(`/courses/${course._id}`);
  };

  return (
    <Card
      className="card-shadow hover:card-shadow-lg transition-smooth group h-full cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <CourseImageCarousel imageUrls={course.imageUrls || []} />

      <CardHeader className="pb-4">
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
      </CardContent>
    </Card>
  );
};

export default function CoursesClient() {
  const coursesData = useQuery(api.courses.listCourses, {});

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding from-primary/5 via-background to-accent/5 bg-gradient-to-br">
        <div className="container text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="from-primary to-primary/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              All Courses
            </h1>
            <p className="text-muted-foreground mb-8 text-xl leading-relaxed">
              Explore our complete range of courses and programs designed to
              help you grow and succeed
            </p>
          </div>
        </div>
      </section>

      {/* Course Types Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Course Categories
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Choose from our diverse range of course types to find the perfect
              learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Certificate Courses */}
            <Link
              href="/courses/certificate"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Certificate Courses
              </h3>
              <p className="text-muted-foreground text-sm">
                Professional certification programs to enhance your skills and
                credentials
              </p>
            </Link>

            {/* Internship Programs */}
            <Link
              href="/courses/internship"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Internship Programs
              </h3>
              <p className="text-muted-foreground text-sm">
                Hands-on experience through structured internship opportunities
              </p>
            </Link>

            {/* Diploma Programs */}
            <Link
              href="/courses/diploma"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Diploma Programs
              </h3>
              <p className="text-muted-foreground text-sm">
                Comprehensive diploma courses for in-depth knowledge and
                expertise
              </p>
            </Link>

            {/* Pre-recorded Courses */}
            <Link
              href="/courses/pre-recorded"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Pre-recorded Courses
              </h3>
              <p className="text-muted-foreground text-sm">
                Self-paced learning with pre-recorded video content
              </p>
            </Link>

            {/* Masterclasses */}
            <Link
              href="/courses/masterclass"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Masterclasses
              </h3>
              <p className="text-muted-foreground text-sm">
                Intensive sessions with industry experts and thought leaders
              </p>
            </Link>

            {/* Therapy Sessions */}
            <Link
              href="/courses/therapy"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Therapy Sessions
              </h3>
              <p className="text-muted-foreground text-sm">
                Professional therapy and counseling services for mental wellness
              </p>
            </Link>

            {/* Supervised Programs */}
            <Link
              href="/courses/supervised"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Supervised Programs
              </h3>
              <p className="text-muted-foreground text-sm">
                Guided learning programs with expert supervision and mentorship
              </p>
            </Link>

            {/* Resume Studio */}
            <Link
              href="/courses/resume-studio"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Resume Studio
              </h3>
              <p className="text-muted-foreground text-sm">
                Professional resume building and career development services
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* All Courses Section */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="bg-primary/10 mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full">
              <BookOpen className="text-primary h-10 w-10" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              All Available Courses
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Browse our complete collection of courses across all categories
            </p>
          </div>

          {coursesData && coursesData.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const nameToCourses = new Map<string, Array<Doc<"courses">>>();
                for (const course of coursesData) {
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
                We&apos;re working on adding new courses. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
