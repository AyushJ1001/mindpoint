"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import {
  Plus,
  Minus,
  Trash2,
  Users,
  BookOpen,
  Clock,
  Award,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Calendar,
  MapPin,
  ShoppingCart,
  Sparkles,
  HeartHandshake,
  Star,
  TrendingUp,
} from "lucide-react";
import CourseImageGallery from "@/components/course/gallery";
import TrustBar from "@/components/course/trust-bar";
import StickyCTA from "@/components/course/sticky-cta";
import { StarRating } from "@/components/course/ratings";
import ReviewForm from "@/components/course/review-form";
import StructuredContent from "@/components/course/structured-content";
import { parseFaqMarkdown } from "@/components/course/faq";
import CourseModulesSection from "@/components/course/course-modules-section";
import InternshipSection from "@/components/course/internship-section";
import Educators from "@/components/course/educators";
import type { Doc } from "@/convex/_generated/dataModel";

type Course = {
  id: string;
  name: string;
  description: string;
  type: "certificate" | "internship" | "course";
  price: number;
  imageUrls: string[];
  capacity?: number;
  enrolled?: number;
  sessions?: number;
  duration?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
};

type Review = { id: string; rating: number; content: string };

const INR = "en-IN";

function formatINR(value: number): string {
  try {
    return new Intl.NumberFormat(INR, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value}`;
  }
}

function parseUTCDateOnly(dateStr: string): Date | null {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = isoDate.exec(dateStr);
  if (match)
    return new Date(
      Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
    );
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function getOrdinal(n: number) {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return "th";
  if (rem10 === 1) return "st";
  if (rem10 === 2) return "nd";
  if (rem10 === 3) return "rd";
  return "th";
}

function formatDateCommon(dateStr: string) {
  const d = parseUTCDateOnly(dateStr);
  if (!d) return dateStr;
  const day = d.getUTCDate();
  const month = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  const year = d.getUTCFullYear();
  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

const SAMPLE_COURSE: Course = {
  id: "dream-therapy",
  name: "Dream Therapy: Foundations to Practice",
  description:
    "Discover the psychology of dreams and learn practical, evidence-based frameworks for analysis and therapy. Build confidence with role-plays, case studies, and guided journaling.",
  type: "course",
  price: 3499,
  imageUrls: [
    "/blue-dream-therapy-hero.png",
    "/online-classroom-discussion.png",
    "/dream-journal-writing.png",
  ],
  capacity: 25,
  enrolled: 21,
  sessions: 6,
  duration: "6 weeks",
  startDate: "2025-09-10",
  endDate: "2025-10-22",
  startTime: "18:30",
  endTime: "20:00",
  daysOfWeek: ["Mon", "Wed"],
};

const RELATED: Course[] = [
  {
    ...SAMPLE_COURSE,
    id: "jungian",
    name: "Jungian Dream Analysis",
    price: 3999,
    imageUrls: ["/jungian-archetypes-collage.png"],
  },
  {
    ...SAMPLE_COURSE,
    id: "freudian",
    name: "Freudian Dream Interpretation",
    price: 3299,
    imageUrls: ["/freudian-symbols-surreal.png"],
  },
  {
    ...SAMPLE_COURSE,
    id: "sleep-science",
    name: "Neuroscience of Sleep & Dreams",
    price: 4599,
    imageUrls: ["/sleep-neuroscience-brainwaves.png"],
  },
];

const REVIEWS: Review[] = [
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
];

function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);
  return { ref, isVisible } as const;
}

type CourseVariant = Doc<"courses">;

export default function CourseClient({
  course,
  variants = [],
}: {
  course: Doc<"courses">;
  variants?: CourseVariant[];
}) {
  console.log(course);
  const router = useRouter();
  const [activeCourse, setActiveCourse] = useState<Doc<"courses">>(course);
  useEffect(() => {
    setActiveCourse(course);
  }, [course]);

  const heroAnimation = useScrollAnimation();
  const statsAnimation = useScrollAnimation();
  const featuresAnimation = useScrollAnimation();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  useEffect(() => {
    const calculate = () => {
      const startDate = new Date(course.startDate + "T00:00:00");
      const now = new Date();
      const diff = startDate.getTime() - now.getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculate();
    const t = setInterval(calculate, 1000);
    return () => clearInterval(t);
  }, [course.startDate]);

  const { addItem, inCart, updateItemQuantity, removeItem, items } = useCart();

  // Helper function to get current quantity of a course in cart
  const getCurrentQuantity = (courseId: string) => {
    const cartItem = items.find((item) => item.id === courseId);
    return cartItem?.quantity || 0;
  };

  // Helper function to handle quantity increase
  const handleIncreaseQuantity = (course: Doc<"courses">) => {
    const currentQuantity = getCurrentQuantity(course._id);
    const maxQuantity = course.capacity || 1;

    if (currentQuantity === 0) {
      // Add to cart if not already there
      addItem({
        id: course._id,
        name: course.name,
        description: course.description,
        price: course.price || 100,
        imageUrls: course.imageUrls || [],
        capacity: course.capacity || 1,
        quantity: 1, // Explicitly set initial quantity to 1
      });
    } else if (currentQuantity < maxQuantity) {
      // Increase quantity if below capacity
      updateItemQuantity(course._id, currentQuantity + 1);
    }
  };

  // Helper function to handle quantity decrease
  const handleDecreaseQuantity = (course: Doc<"courses">) => {
    const currentQuantity = getCurrentQuantity(course._id);

    if (currentQuantity > 1) {
      updateItemQuantity(course._id, currentQuantity - 1);
    } else if (currentQuantity === 1) {
      removeItem(course._id);
    }
  };

  const [faqMarkdown, setFaqMarkdown] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/faq.md", { cache: "force-cache" });
        if (!res.ok) throw new Error("Failed to load faq.md");
        const text = await res.text();
        if (!cancelled) setFaqMarkdown(text);
      } catch (err) {
        if (!cancelled) setFaqMarkdown(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const seatsLeft = Math.max(
    0,
    (course.capacity ?? 0) - (course.enrolledUsers?.length ?? 0),
  );

  // Check if course is out of stock (capacity 0 or no seats left)
  const isOutOfStock = (course.capacity ?? 0) === 0 || seatsLeft === 0;

  // Build variant options only for internship or therapy
  const normalizedVariants: CourseVariant[] = useMemo(() => {
    const sameGroup = variants
      .filter((v) => v.name === course.name && v.type === course.type)
      .concat([]);
    // Ensure current course is included
    const present = sameGroup.some((v) => v._id === course._id);
    if (!present) sameGroup.push(course);
    // Sort by sessions (therapy) or duration/price
    if (course.type === "therapy") {
      sameGroup.sort((a, b) => {
        const as = (a as any).sessions ?? 0;
        const bs = (b as any).sessions ?? 0;
        return as - bs || (a.price ?? 0) - (b.price ?? 0);
      });
    } else if (course.type === "internship") {
      // Try to sort by duration if present, else by price
      const parseWeeks = (d?: string) => {
        if (!d) return Number.MAX_SAFE_INTEGER;
        const m = d.match(/(\d+)\s*week/i);
        return m ? Number.parseInt(m[1]!, 10) : Number.MAX_SAFE_INTEGER;
      };
      sameGroup.sort((a, b) => {
        const aw = parseWeeks((a as any).duration);
        const bw = parseWeeks((b as any).duration);
        if (aw !== bw) return aw - bw;
        return (a.price ?? 0) - (b.price ?? 0);
      });
    }
    return sameGroup;
  }, [variants, course]);

  const shouldShowVariantSelect =
    (course.type === "therapy" || course.type === "internship") &&
    normalizedVariants.length > 1;

  const variantLabel = (v: CourseVariant) => {
    if (course.type === "therapy") {
      const s = (v as any).sessions as number | undefined;
      if (typeof s === "number" && s > 0)
        return `${s} ${s === 1 ? "session" : "sessions"}`;
    }
    if (course.type === "internship") {
      const d = (v as any).duration as string | undefined;
      if (d && d.trim()) return d.trim();
      // Fallbacks for internships
      const m =
        v.name.match(/(\d+\s*weeks?)/i) ||
        (v.description ?? "").match(/(\d+\s*weeks?)/i);
      if (m) return m[1]!;
    }
    // Generic fallback
    if (typeof (v as any).duration === "string" && (v as any).duration) {
      return (v as any).duration as string;
    }
    if (typeof (v as any).sessions === "number") {
      const s = (v as any).sessions as number;
      return `${s} ${s === 1 ? "session" : "sessions"}`;
    }
    return "Option";
  };

  const displayCourse = activeCourse ?? course;

  const handleVariantSelect = (val: string) => {
    if (!val) return;
    if ((displayCourse._id as unknown as string) === val) return;
    const target = normalizedVariants.find(
      (v) => (v._id as unknown as string) === val,
    );
    if (target) {
      // Instantly update UI client-side
      setActiveCourse(target);
      // Update URL without full navigation to avoid white flash
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/courses/${val}`);
      }
    } else {
      router.replace(`/courses/${val}`, { scroll: false } as any);
    }
  };

  return (
    <div className="from-background via-background to-muted/20 min-h-screen overflow-x-clip bg-gradient-to-br">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/10 absolute bottom-0 left-0 h-96 w-96 rounded-full blur-3xl" />

        <div className="relative z-10 container">
          <div className="text-muted-foreground mb-6 text-sm">
            <Link
              href="/courses"
              className="hover:text-foreground transition-colors"
            >
              Courses
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">{course.name}</span>
          </div>

          <div
            ref={heroAnimation.ref}
            className={`grid grid-cols-1 gap-12 transition-all duration-1000 ease-out lg:grid-cols-2 ${
              heroAnimation.isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {/* Left Column - Course Image */}
            <div className="space-y-6">
              <div className="border-primary/20 from-primary/5 to-accent/5 relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-2 shadow-2xl">
                <div className="bg-primary/20 absolute top-0 left-0 h-32 w-32 rounded-full blur-2xl" />
                <div className="bg-accent/20 absolute right-0 bottom-0 h-32 w-32 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <CourseImageGallery
                    imageUrls={displayCourse.imageUrls ?? []}
                  />
                </div>
              </div>
              <TrustBar />
            </div>

            {/* Right Column - Course Details */}
            <div className="flex flex-col gap-8">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                {seatsLeft > 0 && seatsLeft <= 5 && (
                  <Badge variant="destructive" className="animate-pulse">
                    🔥 Only {seatsLeft} seats left
                  </Badge>
                )}
                {seatsLeft === 0 && (
                  <Badge variant="secondary">📋 Waitlist Available</Badge>
                )}
                <Badge
                  variant="outline"
                  className="border-primary/50 text-primary"
                >
                  {course.type ?? "Course"}
                </Badge>
              </div>

              {/* Course Title & Description */}
              <div className="space-y-4">
                <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl">
                  {displayCourse.name}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Guided, interactive classes with recordings and lifetime
                  support.
                </p>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  {
                    icon: Users,
                    label: "Students",
                    value: course.enrolledUsers?.length || 0,
                  },
                  {
                    icon: BookOpen,
                    label: "Sessions",
                    value: displayCourse.sessions || 6,
                  },
                  {
                    icon: Clock,
                    label: "Duration",
                    value: course.duration || "6 weeks",
                  },
                  { icon: Award, label: "Certificate", value: "Yes" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                      <stat.icon className="text-primary h-6 w-6" />
                    </div>
                    <div className="text-muted-foreground text-sm font-medium">
                      {stat.label}
                    </div>
                    <div className="text-lg font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Pricing Card */}
              <Card className="border-primary/20 from-background to-primary/5 border-2 bg-gradient-to-br shadow-xl">
                <CardContent className="p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-3">
                        <span className="text-primary text-4xl font-bold">
                          {formatINR(displayCourse.price)}
                        </span>
                        <span className="text-muted-foreground text-sm line-through">
                          {formatINR(displayCourse.price * 1.5)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Inclusive of all taxes • Limited time offer
                      </p>
                    </div>

                    {shouldShowVariantSelect && (
                      <Select
                        key={displayCourse._id as unknown as string}
                        value={displayCourse._id as unknown as string}
                        onValueChange={handleVariantSelect}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Choose option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              {course.type === "therapy"
                                ? "Sessions"
                                : "Duration"}
                            </SelectLabel>
                            {normalizedVariants.map((v) => (
                              <SelectItem
                                key={v._id}
                                value={v._id as unknown as string}
                              >
                                <span className="font-medium">
                                  {variantLabel(v)}
                                </span>{" "}
                                <span className="text-muted-foreground">
                                  — {formatINR(v.price)}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {isOutOfStock ? (
                      <Button disabled className="h-12 w-full text-base">
                        Out of Stock
                      </Button>
                    ) : inCart(displayCourse._id) ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDecreaseQuantity(displayCourse)
                            }
                            className="h-10 w-10 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-[3rem] text-center font-medium">
                            {getCurrentQuantity(displayCourse._id)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleIncreaseQuantity(displayCourse)
                            }
                            disabled={
                              getCurrentQuantity(displayCourse._id) >=
                              (displayCourse.capacity || 1)
                            }
                            className="h-10 w-10 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(displayCourse._id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleIncreaseQuantity(displayCourse)}
                        className="h-12 w-full text-base font-semibold"
                        size="lg"
                      >
                        🛒 Add to Cart
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="h-12 w-full border-2 bg-transparent text-base font-semibold"
                      disabled={isOutOfStock}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Card */}
              <Card className="border-muted border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="text-primary h-5 w-5" />
                    Schedule & Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <Calendar className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Start Date</div>
                      <div className="text-muted-foreground text-sm">
                        {formatDateCommon(course.startDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <Clock className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Time</div>
                      <div className="text-muted-foreground text-sm">
                        {course.startTime} - {course.endTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <MapPin className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Days</div>
                      <div className="text-muted-foreground text-sm">
                        {course.daysOfWeek.join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <TrendingUp className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Duration</div>
                      <div className="text-muted-foreground text-sm">
                        {course.duration || "6 weeks"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="border-primary/20 from-primary/5 to-accent/5 rounded-xl border-2 bg-gradient-to-r p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-primary h-6 w-6" />
                    <span className="font-medium">
                      Practical, guided learning
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HeartHandshake className="text-primary h-6 w-6" />
                    <span className="font-medium">Lifetime doubt clearing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Enhanced Stats Section */}
      <section className="py-16">
        <div className="container">
          <div
            ref={statsAnimation.ref}
            className={`mx-auto max-w-6xl transition-all duration-1000 ease-out ${
              statsAnimation.isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Course Highlights
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to know at a glance
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  label: "Start Date",
                  value: formatDateCommon(course.startDate),
                  icon: Calendar,
                },
                {
                  label: "Duration",
                  value: course.duration || "6 weeks",
                  icon: Clock,
                },
                {
                  label: "Time Slot (IST)",
                  value: `${course.startTime} - ${course.endTime}`,
                  icon: Clock,
                },
                { label: "Language", value: "English", icon: BookOpen },
                {
                  label: "Investment",
                  value: formatINR(course.price),
                  icon: Award,
                },
              ].map((item, idx) => (
                <Card
                  key={idx}
                  className={`group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    statsAnimation.isVisible
                      ? `animate-in slide-in-from-bottom-4 duration-700 delay-${idx * 100}`
                      : ""
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary/10 group-hover:bg-primary/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                      <item.icon className="text-primary h-6 w-6" />
                    </div>
                    <div className="text-muted-foreground mb-1 text-sm font-medium">
                      {item.label}
                    </div>
                    <div className="font-semibold">{item.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Countdown Timer */}
            <div className="mt-16 text-center">
              <h3 className="mb-6 text-2xl font-semibold">
                Course Starting In
              </h3>
              <div className="border-primary/20 from-primary/5 to-accent/5 mx-auto max-w-2xl rounded-2xl border-2 bg-gradient-to-br p-8">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds },
                  ].map((time, idx) => (
                    <div key={idx} className="text-center">
                      <div className="border-primary/30 bg-background text-primary mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-xl border-2 text-2xl font-bold">
                        {String(time.value).padStart(2, "0")}
                      </div>
                      <div className="text-muted-foreground text-sm font-medium">
                        {time.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Course Overview */}
      <section className="from-muted/20 to-background bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
              <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
                <CardHeader className="pb-6 text-center">
                  <CardTitle className="text-4xl font-bold md:text-5xl">
                    Course Overview
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Comprehensive learning experience designed for your success
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-lg dark:prose-invert mx-auto max-w-none">
                  <StructuredContent text={course.description ?? ""} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Outcomes */}
      <section className="py-16">
        <div className="container">
          <div
            ref={featuresAnimation.ref}
            className={`transition-all duration-1000 ease-out ${
              featuresAnimation.isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                What You'll Master
              </h2>
              <p className="text-muted-foreground text-lg">
                Practical skills and knowledge you'll gain from this course
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {course.learningOutcomes?.map((outcome, idx) => (
                <div
                  key={idx}
                  className={`group transition-all duration-500 delay-${idx * 100} ${
                    featuresAnimation.isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <div className="border-primary/30 bg-primary/10 absolute -inset-1 -z-10 translate-x-2 translate-y-2 rounded-xl border-2 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
                    <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br p-8 text-center transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                      <div className="mb-4 text-5xl">{outcome.icon}</div>
                      <h3 className="text-lg font-semibold">{outcome.title}</h3>
                    </Card>
                  </div>
                </div>
              )) ||
                // Fallback content if no learning outcomes
                [
                  { icon: "🧠", title: "Deep Understanding" },
                  { icon: "🛠️", title: "Practical Skills" },
                  { icon: "📊", title: "Real-world Application" },
                  { icon: "🎯", title: "Expert Guidance" },
                ].map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="relative overflow-hidden rounded-xl">
                      <div className="border-primary/30 bg-primary/10 absolute -inset-1 -z-10 translate-x-2 translate-y-2 rounded-xl border-2 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
                      <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br p-8 text-center transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                        <div className="mb-4 text-5xl">{item.icon}</div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                      </Card>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Educators Section */}
      <Educators />

      {/* Course Modules or Internship Section */}
      {course.type === "internship" ? (
        <section className="from-background to-muted/20 bg-gradient-to-br py-16">
          <div className="container">
            <InternshipSection internship={course} />
          </div>
        </section>
      ) : (
        <section className="from-background to-muted/20 bg-gradient-to-br py-16">
          <div className="container">
            <CourseModulesSection modules={course.modules ?? []} />
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-lg">
                Get answers to common questions about this course
              </p>
            </div>

            <Card className="border-muted border-2 shadow-xl">
              <CardContent className="p-8">
                {faqMarkdown == null ? (
                  <div className="py-8 text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                    <p className="text-muted-foreground">Loading FAQs...</p>
                  </div>
                ) : (
                  (() => {
                    const items = parseFaqMarkdown(faqMarkdown);
                    if (items.length === 0) {
                      return (
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {faqMarkdown}
                          </ReactMarkdown>
                        </div>
                      );
                    }
                    return (
                      <Accordion type="single" collapsible className="w-full">
                        {items.map((item, idx) => (
                          <AccordionItem key={idx} value={`faq-${idx + 1}`}>
                            <AccordionTrigger className="hover:text-primary text-left text-lg font-semibold">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="prose dark:prose-invert max-w-none pt-2">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {item.a}
                                </ReactMarkdown>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    );
                  })()
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="from-muted/20 to-background bg-gradient-to-br py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Student Reviews</h2>
            <p className="text-muted-foreground text-lg">
              Hear from our successful students
            </p>
          </div>

          {REVIEWS.length > 0 ? (
            <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {REVIEWS.map((review, idx) => (
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
              <Star className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <p className="text-muted-foreground text-lg">
                No reviews yet - be the first!
              </p>
            </div>
          )}

          <div className="mx-auto max-w-2xl">
            <ReviewForm />
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h3 className="mb-4 text-3xl font-bold">
              Join Our Learning Community! 🚀
            </h3>
            <p className="mb-8 text-lg text-white/90">
              Connect with fellow learners, share insights, and continue your
              journey together
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="https://chat.whatsapp.com/LYKNhlQbmV84YiBioVo83Y?mode=ac_t"
                className="inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 transition-all hover:bg-gray-100 hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Join WhatsApp Community
              </Link>
              <Link
                href="https://www.instagram.com/channel/AbZNVUaQ3yMrfJGm/?igsh=dTV3MWozOXJsdDFy"
                className="inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 font-semibold text-purple-600 transition-all hover:bg-gray-100 hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                📸 Follow on Instagram
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <StickyCTA
        price={course.price}
        onPrimary={() => handleIncreaseQuantity(course)}
        disabled={
          isOutOfStock ||
          (inCart(course._id) &&
            getCurrentQuantity(course._id) >= (course.capacity || 1))
        }
        inCart={inCart(course._id)}
        quantity={getCurrentQuantity(course._id)}
        isOutOfStock={isOutOfStock}
      />
    </div>
  );
}
