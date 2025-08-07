"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCart } from "react-use-cart";
import { useMemo, useState } from "react";

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
  Plus,
  BookOpen,
  Award,
  Users,
  PlayCircle,
  Lightbulb,
  Heart,
  Eye,
  FileText,
} from "lucide-react";
import { showRupees } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";

// Infer a user-friendly label for a course variant, attempting to extract session count.
function getVariantLabel(course: Doc<"courses">): string {
  const sources = [course.description, course.content, course.name].filter(
    (s): s is string => Boolean(s)
  );
  for (const text of sources) {
    const match = text.match(/(\d+)\s*(?:session|sessions)/i);
    if (match) {
      const count = Number(match[1]);
      return `${count} ${count === 1 ? "session" : "sessions"}`;
    }
  }
  // Fallback to price label if no session count found
  return showRupees(course.price);
}

const CourseCard = ({ variants }: { variants: Doc<"courses">[] }) => {
  const { addItem, inCart } = useCart();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selected = variants[Math.min(selectedIndex, variants.length - 1)];

  const handleAddToCart = () => {
    addItem({
      id: selected._id,
      name: selected.name,
      description: selected.description,
      price: selected.price || 100,
      imageUrls: selected.imageUrls || [],
      capacity: selected.capacity || 1,
    });
  };

  return (
    <Card className="card-shadow hover:card-shadow-lg transition-smooth group h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="group-hover:text-primary transition-smooth text-lg">
              {selected.name}
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-relaxed">
              {selected.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {variants.length > 1 && (
          <div className="flex items-center gap-3">
            <label htmlFor={`variant-${selected._id}`} className="text-sm font-medium">
              Select option
            </label>
            <select
              id={`variant-${selected._id}`}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
            >
              {variants.map((variant, idx) => (
                <option key={variant._id} value={idx}>
                  {getVariantLabel(variant)} • {showRupees(variant.price)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="px-3 py-1 text-base font-semibold">
            {showRupees(selected.price || 100)}
          </Badge>
          <Button
            onClick={handleAddToCart}
            disabled={inCart(selected._id)}
            size="sm"
            className="transition-smooth"
          >
            <Plus className="mr-2 h-4 w-4" />
            {inCart(selected._id) ? "Added" : "Add to Cart"}
          </Button>
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

  const groupedVariants = useMemo(() => {
    const list = courses?.courses ?? [];
    if (courseType !== "therapy") {
      return list.map((c) => [c] as Doc<"courses">[]);
    }
    const map = new Map<string, Doc<"courses">[]>();
    for (const c of list) {
      const key = c.name.trim().toLowerCase();
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    // Sort each group by price ascending for a nicer default
    const groups = Array.from(map.values()).map((arr) =>
      [...arr].sort((a, b) => a.price - b.price)
    );
    return groups;
  }, [courses?.courses, courseType]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding from-primary/5 via-background to-accent/5 bg-gradient-to-br">
        <div className="container text-center">
          <div className="mx-auto max-w-4xl">
            <div className="bg-primary/10 mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full">
              <Icon className="text-primary h-10 w-10" />
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
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Available Courses</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Explore our {title.toLowerCase()} and start your learning journey today
            </p>
          </div>

          {groupedVariants && groupedVariants.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {groupedVariants.map((variantGroup) => (
                <CourseCard key={variantGroup[0]._id} variants={variantGroup} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-xl font-semibold">No courses available yet</h3>
              <p className="text-muted-foreground">
                We're working on adding new {title.toLowerCase()} courses. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
