"use client";

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

const CourseImageCarousel = ({ imageUrls }: { imageUrls: string[] }) => {
  const actualImageUrls = imageUrls.map((id) =>
    useQuery(api.image.getImageUrl, {
      storageId: id as Id<"_storage">,
    }),
  );

  console.log(actualImageUrls);

  if (!actualImageUrls || actualImageUrls.length === 0) {
    return (
      <div className="relative flex h-80 items-center justify-center rounded-t-lg bg-gray-100">
        <BookOpen className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  if (actualImageUrls.length === 1) {
    return (
      <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-t-lg bg-gray-100">
        <Image
          src={
            actualImageUrls[0]?.url ??
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
    <div className="relative h-80 overflow-hidden rounded-t-lg bg-gray-100">
      <Carousel className="h-full w-full">
        <CarouselContent>
          {actualImageUrls.map((imageUrl, index) => (
            <CarouselItem
              key={index}
              className="flex h-80 items-center justify-center"
            >
              <Image
                src={imageUrl?.url || ""}
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

const CourseCard = ({ course }: { course: Doc<"courses"> }) => {
  const { addItem, inCart } = useCart();
  console.log(course.imageUrls);

  const handleAddToCart = () => {
    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: course.price || 100,
      imageUrls: course.imageUrls || [],
      capacity: course.capacity || 1,
    });
  };

  return (
    <Card className="card-shadow hover:card-shadow-lg transition-smooth group h-full overflow-hidden">
      <CourseImageCarousel imageUrls={course.imageUrls || []} />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="group-hover:text-primary transition-smooth text-lg">
              {course.name}
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-relaxed">
              {course.description}
            </CardDescription>
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
            <Button
              onClick={handleAddToCart}
              disabled={inCart(course._id)}
              size="sm"
              className="transition-smooth"
            >
              <Plus className="mr-2 h-4 w-4" />
              {inCart(course._id) ? "Added" : "Add to Cart"}
            </Button>
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
        <div className="container text-center">
          <div className="mx-auto max-w-4xl">
            <div className="bg-primary/10 mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full">
              {Icon && <Icon className="text-primary h-10 w-10" />}
            </div>
            <h1 className="from-primary to-primary/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              {title}
            </h1>
            <p className="text-muted-foreground mb-8 text-xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Available Courses
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Explore our {title.toLowerCase()} and start your learning journey
              today
            </p>
          </div>

          {courses?.courses && courses.courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
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
