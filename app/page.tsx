"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCart } from "react-use-cart";
import { useRouter } from "next/navigation";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Plus, Star, Users, Award, BookOpen } from "lucide-react";
import { showRupees } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { CourseImageCarousel } from "@/components/CourseTypePage";

const CourseCard = ({ course }: { course: Doc<"courses"> }) => {
  const { addItem, inCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: course.price || 100,
      imageUrls: course.imageUrls || [],
      capacity: course.capacity || 1,
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
      {/* Course Image */}
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
      </CardContent>
    </Card>
  );
};

export default function Home() {
  const courses = useQuery(api.courses.listCourses, { count: undefined });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding from-primary/5 via-background to-accent/5 bg-gradient-to-br">
        <div className="container text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="from-primary to-primary/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl lg:text-6xl">
              The Mind Point
            </h1>
            <p className="text-muted-foreground mb-8 text-xl leading-relaxed md:text-2xl">
              Empowering minds through comprehensive mental health education and
              professional development
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="transition-smooth px-8 py-6 text-lg hover:cursor-pointer"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Courses
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="transition-smooth px-8 py-6 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
                <Users className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">1000+</h3>
              <p className="text-muted-foreground">Students Enrolled</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
                <Award className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">50+</h3>
              <p className="text-muted-foreground">Certified Courses</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
                <Star className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">4.9</h3>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Featured Courses
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Discover our comprehensive range of mental health and professional
              development courses
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
                No courses available
              </h3>
              <p className="text-muted-foreground">
                Check back soon for new courses and programs
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
