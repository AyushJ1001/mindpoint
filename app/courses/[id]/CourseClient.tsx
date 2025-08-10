"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { Plus, Minus, Trash2 } from "lucide-react";

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
  Clock,
  MapPin,
  ShoppingCart,
  Sparkles,
  HeartHandshake,
  CircleCheck,
} from "lucide-react";
import CourseImageGallery from "@/components/course/gallery";
import TrustBar from "@/components/course/trust-bar";
import StickyCTA from "@/components/course/sticky-cta";
import { StarRating } from "@/components/course/ratings";
import ReviewForm from "@/components/course/review-form";
import StructuredContent from "@/components/course/structured-content";
import { parseFaqMarkdown } from "@/components/course/faq";
import CourseModulesSection from "@/course-modules-section";
import Educators from "@/components/course/educators";
import { Doc, Id } from "@/convex/_generated/dataModel";

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

// FAQ content is now loaded from `/public/faq.md` at runtime.

function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course._id]);

  const cardsAnimation = useScrollAnimation();
  const countdownAnimation = useScrollAnimation();
  const detailsAnimation = useScrollAnimation();

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
        return m ? parseInt(m[1]!, 10) : Number.MAX_SAFE_INTEGER;
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
    <div className="min-h-screen overflow-x-clip">
      <section className="from-primary/5 via-background to-accent/5 bg-gradient-to-br py-6 md:py-8">
        <div className="container">
          <div className="text-muted-foreground mb-4 text-sm">
            <Link href="/courses" className="hover:text-foreground">
              Courses
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{course.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="min-w-0">
              <div className="border-primary bg-primary/5 relative overflow-hidden rounded-xl border-2 p-1">
                <div className="bg-primary/20 absolute top-[-30%] left-[-15%] h-60 w-60 rounded-full blur-3xl" />
                <div className="bg-primary/15 absolute right-[-15%] bottom-[-30%] h-60 w-60 rounded-full blur-3xl" />
                <div className="overflow-visible">
                  <CourseImageGallery
                    imageUrls={displayCourse.imageUrls ?? []}
                  />
                </div>
              </div>
              <div className="mt-3">
                <TrustBar />
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24">
              {seatsLeft > 0 && seatsLeft <= 5 && (
                <Badge variant="default" className="w-fit">
                  Limited seats: {seatsLeft} left
                </Badge>
              )}
              {seatsLeft === 0 && (
                <Badge variant="secondary" className="w-fit">
                  Waitlist
                </Badge>
              )}

              <div>
                <h1 className="mb-2 break-words">{displayCourse.name}</h1>
                <p className="text-muted-foreground">
                  Guided, interactive classes with recordings and lifetime
                  support.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {course.type ?? "Course"}
                </Badge>
                {displayCourse.sessions ? (
                  <Badge className="text-sm whitespace-nowrap">
                    {displayCourse.sessions} sessions
                  </Badge>
                ) : null}
                {Number.isFinite(displayCourse.capacity ?? 0) && (
                  <Badge className="text-sm whitespace-nowrap">
                    Capacity: {displayCourse.capacity}
                  </Badge>
                )}
              </div>

              <Card className="card-shadow overflow-visible">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex flex-row flex-wrap items-center gap-3">
                    <div className="flex items-baseline gap-2 whitespace-nowrap">
                      <span className="text-primary text-3xl font-bold">
                        {formatINR(displayCourse.price)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        incl. taxes
                      </span>
                    </div>

                    {shouldShowVariantSelect && (
                      <div className="ml-2 max-w-full">
                        <Select
                          key={displayCourse._id as unknown as string}
                          value={displayCourse._id as unknown as string}
                          onValueChange={handleVariantSelect}
                        >
                          <SelectTrigger
                            size="sm"
                            className="w-full max-w-[280px] min-w-40 truncate"
                          >
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
                        {/* Hidden links to enable Next prefetch */}
                        <div className="hidden">
                          {normalizedVariants.map((v) => (
                            <Link
                              key={v._id}
                              href={`/courses/${v._id}`}
                              prefetch
                            >
                              {v._id}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {inCart(displayCourse._id) ? (
                      <div className="flex w-full items-center gap-2 sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDecreaseQuantity(displayCourse)}
                          className="h-10 w-10 p-0"
                          title="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[3rem] text-center font-medium">
                          {getCurrentQuantity(displayCourse._id)}
                          {displayCourse.capacity &&
                            displayCourse.capacity > 1 && (
                              <span className="text-muted-foreground block text-xs">
                                /{displayCourse.capacity}
                              </span>
                            )}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIncreaseQuantity(displayCourse)}
                          disabled={
                            getCurrentQuantity(displayCourse._id) >=
                            (displayCourse.capacity || 1)
                          }
                          className="h-10 w-10 p-0"
                          title={
                            getCurrentQuantity(displayCourse._id) >=
                            (displayCourse.capacity || 1)
                              ? "Maximum capacity reached"
                              : "Increase quantity"
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(displayCourse._id)}
                          className="h-10 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="Remove from cart"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleIncreaseQuantity(displayCourse)}
                        className="w-full text-base sm:w-auto"
                      >
                        + Add to cart
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full text-base sm:w-auto"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> Buy now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Schedule</CardTitle>
                  <CardDescription>Key timings and dates</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Start: {formatDateCommon(course.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>End: {formatDateCommon(course.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      {course.startTime} - {course.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{course.daysOfWeek.join(", ")}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="border-primary bg-primary/5 flex flex-wrap items-center gap-3 rounded-lg border p-3">
                <Sparkles className="text-primary h-5 w-5" />
                <span className="text-foreground text-sm font-medium">
                  Practical, guided learning
                </span>
                <span className="text-muted-foreground">•</span>
                <HeartHandshake className="text-primary h-5 w-5" />
                <span className="text-foreground text-sm font-medium">
                  Lifetime doubt clearing
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-6" />

      <section className="py-8">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div
              ref={cardsAnimation.ref}
              className={`mb-8 grid grid-cols-1 gap-4 transition-all duration-1000 ease-out sm:grid-cols-2 lg:grid-cols-5 ${cardsAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              {[
                {
                  label: "Start Date",
                  value: formatDateCommon(course.startDate),
                },
                { label: "Duration", value: course.duration || "3 Days" },
                {
                  label: "Choose Time Slot (IST)",
                  value: `${course.startTime} - ${course.endTime}`,
                },
                { label: "Language", value: "English" },
                { label: "Contribution", value: formatINR(course.price) },
              ].map((it, idx) => {
                const delays = [
                  "delay-100",
                  "delay-200",
                  "delay-300",
                  "delay-400",
                  "delay-500",
                ] as const;
                const delayClass = delays[idx] ?? "";
                return (
                  <Card
                    key={idx}
                    className={`p-4 text-center transition-all ${delayClass} duration-500 ease-out ${cardsAnimation.isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"}`}
                  >
                    <CardContent className="p-4">
                      <div className="text-foreground text-sm font-medium">
                        {it.label}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {it.value}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div
              ref={countdownAnimation.ref}
              className={`mb-8 text-center transition-all delay-300 duration-1000 ease-out ${countdownAnimation.isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"}`}
            >
              <h2 className="text-foreground mb-4 text-2xl font-semibold">
                Workshop Starting In
              </h2>
              <div className="border-primary bg-primary/10 rounded-lg border-2 p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { k: "days", v: timeLeft.days },
                    { k: "hours", v: timeLeft.hours },
                    { k: "mins", v: timeLeft.minutes },
                    { k: "secs", v: timeLeft.seconds },
                  ].map((t) => (
                    <div
                      key={t.k}
                      className="border-primary/30 bg-background rounded-lg border p-4"
                    >
                      <div className="text-primary text-2xl font-bold">
                        {String(t.v).padStart(2, "0")}
                      </div>
                      <div className="text-muted-foreground text-sm">{t.k}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={detailsAnimation.ref}
              className={`grid grid-cols-1 gap-8 transition-all delay-500 duration-1000 ease-out lg:grid-cols-3 ${detailsAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <div className="lg:col-span-3">
                <Card
                  className={`border-primary bg-primary/5 border-2 transition-all delay-700 duration-700 ease-out ${detailsAnimation.isVisible ? "translate-x-0 scale-100 opacity-100" : "-translate-x-8 scale-95 opacity-0"}`}
                >
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      {course.name} Challenge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-primary h-4 w-4" />
                      <span>
                        {formatDateCommon(course.startDate)} -{" "}
                        {formatDateCommon(course.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="text-primary h-4 w-4" />
                      <span>Multiple time slots available</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-primary font-bold">₹</span>
                      <span>Contribution: {formatINR(course.price)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="text-primary h-4 w-4" />
                      <span>Recording available: 1 week</span>
                    </div>
                    <div className="pt-4">
                      <Button className="w-full">Register Now</Button>
                    </div>
                    <div className="space-y-2">
                      {[
                        "Reduced junk food addiction",
                        "Improved mental clarity",
                        "Better sleep patterns",
                      ].map((t, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CircleCheck className="h-4 w-4 text-green-600" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden">
              <div className="border-primary/30 bg-primary/10 pointer-events-none absolute -inset-2 -z-10 translate-x-3 translate-y-3 border-2" />
              <Card className="border-primary bg-primary/5 rounded-none border-[3px]">
                <CardHeader className="items-center pb-4 text-center">
                  <CardTitle className="text-foreground font-serif text-4xl font-semibold md:text-5xl">
                    Course Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral dark:prose-invert mx-auto text-center font-serif">
                    <StructuredContent text={course.description ?? ""} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <h2 className="mb-6 text-center font-serif text-4xl font-semibold md:text-5xl">
            What will you learn?
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {course.learningOutcomes?.map((item, idx) => (
              <div key={idx} className="relative overflow-hidden">
                <div className="border-primary/30 bg-primary/10 pointer-events-none absolute -inset-1 -z-10 translate-x-1 translate-y-1 border-2" />
                <div className="border-primary bg-primary/5 rounded-none border-[3px] p-6 shadow-lg">
                  <div className="text-4xl">{item.icon}</div>
                  <p className="mt-2 font-serif font-semibold">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Educators />

      <section className="py-8">
        <div className="container">
          <CourseModulesSection modules={course.modules ?? []} />
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Common queries answered</CardDescription>
              </CardHeader>
              <CardContent>
                {faqMarkdown == null ? (
                  <p className="text-muted-foreground text-sm">Loading FAQs…</p>
                ) : (
                  (() => {
                    const items = parseFaqMarkdown(faqMarkdown);
                    if (items.length === 0) {
                      return (
                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {faqMarkdown}
                          </ReactMarkdown>
                        </div>
                      );
                    }
                    return (
                      <Accordion type="single" collapsible className="w-full">
                        {items.map((it, idx) => (
                          <AccordionItem key={idx} value={`faq-${idx + 1}`}>
                            <AccordionTrigger>{it.q}</AccordionTrigger>
                            <AccordionContent>
                              <div className="prose prose-neutral dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {it.a}
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

      <section className="py-12">
        <div className="container">
          <h2 className="mb-6 text-2xl font-semibold">What learners say</h2>
          {REVIEWS.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {REVIEWS.map((r) => (
                <Card key={r.id} className="card-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <StarRating rating={r.rating} size="sm" />
                      <span className="text-muted-foreground text-sm">
                        {r.rating.toFixed(1)} / 5
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">
                      {r.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet</p>
          )}
        </div>
      </section>

      <section className="py-12 pt-0">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <ReviewForm />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-8">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center text-white">
            <h3 className="mb-2 text-xl font-semibold">
              Join Our Dream-Sharing Community!
            </h3>
            <p className="text-primary-foreground/80 mb-6 text-sm">
              Connect with fellow learners, share insights, and continue your
              journey together
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="https://chat.whatsapp.com/LYKNhlQbmV84YiBioVo83Y?mode=ac_t"
                className="bg-background text-primary hover:bg-muted inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all hover:shadow-lg"
                aria-label="Join WhatsApp community"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join WhatsApp
              </Link>
              <Link
                href="https://www.instagram.com/channel/AbZNVUaQ3yMrfJGm/?igsh=dTV3MWozOXJsdDFy"
                className="bg-background text-primary hover:bg-muted inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all hover:shadow-lg"
                aria-label="Follow our Instagram channel"
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow Instagram
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StickyCTA
        price={course.price}
        onPrimary={() => handleIncreaseQuantity(course)}
        disabled={
          inCart(course._id) &&
          getCurrentQuantity(course._id) >= (course.capacity || 1)
        }
        inCart={inCart(course._id)}
        quantity={getCurrentQuantity(course._id)}
      />
    </div>
  );
}
