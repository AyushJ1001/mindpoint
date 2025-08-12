"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCart } from "react-use-cart";
import { BookOpen } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  if (typeof (course as any).sessions === "number") {
    const count = (course as any).sessions as number;
    return `${count} ${count === 1 ? "session" : "sessions"}`;
  }
  const duration = (course as any).duration as string | undefined;
  if (typeof duration === "string" && duration.trim().length > 0) {
    return duration.trim();
  }
  return null;
};

const CourseGroupCard = ({ courses }: { courses: Array<Doc<"courses">> }) => {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] =
    React.useState<Doc<"courses"> | null>(courses[0] || null);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem({
        id: selectedVariant._id,
        name: selectedVariant.name,
        price: selectedVariant.price,
        image: selectedVariant.imageUrls?.[0] || "",
        courseType: selectedVariant.type,
        sessions: (selectedVariant as any).sessions,
        duration: (selectedVariant as any).duration,
      });
    }
  };

  const variantLabel = selectedVariant
    ? extractVariantLabel(selectedVariant)
    : null;

  return (
    <Card className="overflow-hidden">
      <CourseImageCarousel imageUrls={selectedVariant?.imageUrls || []} />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">
              {selectedVariant?.name}
            </CardTitle>
            <CardDescription className="mt-2">
              {selectedVariant?.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedVariant?.type}</Badge>
          {variantLabel && <Badge variant="outline">{variantLabel}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select
            value={selectedVariant?._id}
            onValueChange={(value) => {
              const course = courses.find((c) => c._id === value);
              setSelectedVariant(course || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Course Variants</SelectLabel>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name} - {showRupees(course.price)}
                    {extractVariantLabel(course) &&
                      ` (${extractVariantLabel(course)})`}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {selectedVariant ? showRupees(selectedVariant.price) : "N/A"}
          </div>
          <Button onClick={handleAddToCart} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CourseCard = ({ course }: { course: Doc<"courses"> }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: course._id,
      name: course.name,
      price: course.price,
      image: course.imageUrls?.[0] || "",
      courseType: course.type,
      sessions: (course as any).sessions,
      duration: (course as any).duration,
    });
  };

  const variantLabel = extractVariantLabel(course);

  return (
    <Card className="overflow-hidden">
      <CourseImageCarousel imageUrls={course.imageUrls || []} />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{course.name}</CardTitle>
            <CardDescription className="mt-2">
              {course.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{course.type}</Badge>
          {variantLabel && <Badge variant="outline">{variantLabel}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{showRupees(course.price)}</div>
          <Button onClick={handleAddToCart} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CoursesClient() {
  const courses = useQuery(api.courses.listCourses, { count: undefined });
  const [selectedType, setSelectedType] = React.useState<string>("all");

  if (!courses) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading courses...</div>
      </div>
    );
  }

  // Group courses by name to handle variants
  const courseGroups = courses.reduce(
    (groups, course) => {
      const key = course.name;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(course);
      return groups;
    },
    {} as Record<string, Doc<"courses">[]>,
  );

  // Filter courses by type
  const filteredGroups = Object.entries(courseGroups).filter(
    ([_, courseList]) => {
      if (selectedType === "all") return true;
      return courseList.some((course) => course.type === selectedType);
    },
  );

  return (
    <div className="container mx-auto py-8 dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 dark:text-white">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Our Courses</h1>
        <p className="text-muted-foreground mb-6">
          Explore our comprehensive range of mental health and professional
          development programs.
        </p>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="certificate">Certificate</SelectItem>
            <SelectItem value="diploma">Diploma</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="masterclass">Masterclass</SelectItem>
            <SelectItem value="pre-recorded">Pre-recorded</SelectItem>
            <SelectItem value="resume-studio">Resume Studio</SelectItem>
            <SelectItem value="supervised">Supervised</SelectItem>
            <SelectItem value="therapy">Therapy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredGroups.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map(([name, courseList]) => (
            <CourseGroupCard key={name} courses={courseList} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <BookOpen className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <h3 className="mb-2 text-xl font-semibold">No courses found</h3>
          <p className="text-muted-foreground">
            No courses match your selected filter. Try selecting a different
            category.
          </p>
        </div>
      )}
    </div>
  );
}
