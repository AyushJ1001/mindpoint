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
  Check,
  Video,
  Target,
  Star,
  GraduationCap,
  Users2,
  MessageCircle,
  Globe,
  TrendingUp,
  Heart,
  Zap,
  Shield,
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
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
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
import ChoosePlan from "@/components/choose-plan";
import type { Doc } from "@/convex/_generated/dataModel";

// WhatsApp and Instagram SVG Icons
const WhatsAppIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

type Course = {
  id: string;
  name: string;
  description: string;
  type:
    | "certificate"
    | "internship"
    | "diploma"
    | "pre-recorded"
    | "masterclass"
    | "therapy"
    | "supervised"
    | "resume-studio";
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
  type: "therapy",
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

    // Check if this specific course has a valid offer
    const courseHasValidOffer = (() => {
      if (!course.offer) return false;

      const now = new Date();
      const startDate = new Date(course.offer.startDate);
      const endDate = new Date(course.offer.endDate);

      return now >= startDate && now <= endDate;
    })();

    // Calculate the price to use (offer price if available, otherwise regular price)
    const priceToUse =
      courseHasValidOffer && course.offer
        ? course.price - (course.price * course.offer.discount) / 100
        : course.price || 100;

    if (currentQuantity === 0) {
      // Add to cart if not already there
      addItem({
        id: course._id,
        name: course.name,
        description: course.description,
        price: priceToUse,
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

  // Check if course has a valid offer
  const hasValidOffer = useMemo(() => {
    if (!displayCourse.offer) return false;

    const now = new Date();
    const startDate = new Date(displayCourse.offer.startDate);
    const endDate = new Date(displayCourse.offer.endDate);

    return now >= startDate && now <= endDate;
  }, [displayCourse.offer]);

  // Real-time offer countdown timer
  const [offerTimeLeft, setOfferTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    if (!hasValidOffer || !displayCourse.offer) return;

    const updateOfferTime = () => {
      const now = new Date();
      const endDate = new Date(displayCourse.offer!.endDate);
      const timeLeft = endDate.getTime() - now.getTime();

      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        setOfferTimeLeft({ days, hours, minutes });
      } else {
        setOfferTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    updateOfferTime();
    const interval = setInterval(updateOfferTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [hasValidOffer, displayCourse.offer]);

  // Calculate offer price and time left
  const offerDetails = useMemo(() => {
    if (!hasValidOffer || !displayCourse.offer) return null;

    const originalPrice = displayCourse.price;
    const discountAmount = (originalPrice * displayCourse.offer.discount) / 100;
    const offerPrice = originalPrice - discountAmount;

    return {
      originalPrice,
      offerPrice,
      discountAmount,
      discountPercentage: displayCourse.offer.discount,
      offerName: displayCourse.offer.name,
      timeLeft: offerTimeLeft,
    };
  }, [hasValidOffer, displayCourse.offer, displayCourse.price, offerTimeLeft]);

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
    <div className="bg-background min-h-screen">
      {/* 1. Image + Timer + Highlights Section */}
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
                    icon: BookOpen,
                    label: "Past Sessions",
                    value: (displayCourse.sessions || 6) - 1,
                  },
                  {
                    icon: Video,
                    label: "Session Recordings",
                    value: "✓ ",
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
                          {hasValidOffer && offerDetails
                            ? formatINR(offerDetails.offerPrice)
                            : formatINR(displayCourse.price)}
                        </span>
                        {hasValidOffer && offerDetails && (
                          <span className="text-muted-foreground text-sm line-through">
                            {formatINR(offerDetails.originalPrice)}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Inclusive of all taxes
                        {hasValidOffer && offerDetails && (
                          <span className="text-primary font-medium">
                            {" "}
                            • {offerDetails.offerName}
                          </span>
                        )}
                      </p>
                      {hasValidOffer && offerDetails && (
                        <div className="flex items-center gap-2 text-xs font-medium text-orange-600">
                          <span>🔥 {offerDetails.discountPercentage}% OFF</span>
                          <span>•</span>
                          <span>
                            {offerDetails.timeLeft.days > 0 &&
                              `${offerDetails.timeLeft.days}d `}
                            {offerDetails.timeLeft.hours > 0 &&
                              `${offerDetails.timeLeft.hours}h `}
                            {offerDetails.timeLeft.minutes > 0 &&
                              `${offerDetails.timeLeft.minutes}m`}{" "}
                            left
                          </span>
                        </div>
                      )}
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
                  <CardTitle className="flex items-center gap-2 text-lg">
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
                      <TrendingUpIcon className="text-primary h-5 w-5" />
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

      {/* Choose Plan Section for Therapy Courses */}
      {course.type === "therapy" && (
        <section className="py-16">
          <div className="container">
            <ChoosePlan
              onBook={(payload) => {
                console.log("Booking payload:", payload);
              }}
            />
          </div>
        </section>
      )}

      <Separator className="my-8" />

      {/* Countdown Timer Section */}
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

      {/* 2. Overview Section */}
      <section className="from-muted/20 to-background bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
              <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
                <CardHeader className="pb-6 text-center">
                  <CardTitle className="text-3xl font-bold md:text-4xl">
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

      {/* 3. What Will You Learn Section */}
      {course.type === "internship" ? (
        <section className="from-background to-muted/20 bg-gradient-to-br py-16">
          <div className="container">
            <InternshipSection internship={course} />
          </div>
        </section>
      ) : (
        <section className="from-background to-muted/20 bg-gradient-to-br py-16">
          <div className="container">
            <CourseModulesSection
              learningOutcomes={course.learningOutcomes ?? []}
            />
          </div>
        </section>
      )}

      {/* 4. Who Should Do This Course Section */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
              <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
                <CardHeader className="pb-6 text-center">
                  <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl">
                    <Target className="text-primary h-10 w-10" />
                    Who Should Do This Course?
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Find out if this course is the perfect fit for your learning
                    journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[
                      {
                        icon: "🎓",
                        title: "Students & Graduates",
                        description:
                          "Looking to build a strong foundation in psychology and mental health practices.",
                      },
                      {
                        icon: "👨‍⚕️",
                        title: "Healthcare Professionals",
                        description:
                          "Wanting to expand their knowledge and skills in mental health care.",
                      },
                      {
                        icon: "💼",
                        title: "Career Changers",
                        description:
                          "Seeking to transition into the mental health and wellness industry.",
                      },
                      {
                        icon: "🧠",
                        title: "Psychology Enthusiasts",
                        description:
                          "Passionate about understanding human behavior and mental processes.",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="group">
                        <div className="border-primary/20 from-primary/5 to-accent/5 rounded-xl border-2 bg-gradient-to-r p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                          <div className="mb-4 text-4xl">{item.icon}</div>
                          <h3 className="mb-2 text-xl font-semibold">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why This Course Section */}
      <section className="from-muted/20 to-background bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
              <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
                <CardHeader className="pb-6 text-center">
                  <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl">
                    <Star className="text-primary h-10 w-10" />
                    Why Choose This Course?
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Discover what makes this course unique and valuable
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[
                      {
                        icon: Zap,
                        title: "Expert-Led Learning",
                        description:
                          "Learn from industry professionals with years of practical experience.",
                      },
                      {
                        icon: Shield,
                        title: "Comprehensive Curriculum",
                        description:
                          "Well-structured content covering all essential aspects of the subject.",
                      },
                      {
                        icon: Heart,
                        title: "Personalized Support",
                        description:
                          "Get individual attention and support throughout your learning journey.",
                      },
                      {
                        icon: TrendingUp,
                        title: "Career Growth",
                        description:
                          "Gain skills that directly translate to career advancement opportunities.",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="group">
                        <div className="border-primary/20 from-primary/5 to-accent/5 rounded-xl border-2 bg-gradient-to-r p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                          <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                            <item.icon className="text-primary h-6 w-6" />
                          </div>
                          <h3 className="mb-2 text-xl font-semibold">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Educators + Supervisors Section */}
      <section className="py-16">
        <div className="container">
          <Educators />
        </div>
      </section>

      {/* 7. Certification & Its Applications Section */}
      <section className="from-background to-muted/20 bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
              <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
                <CardHeader className="pb-6 text-center">
                  <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl">
                    <Award className="text-primary h-10 w-10" />
                    Certification & Its Applications
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Understand the value and applications of your certification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[
                      {
                        icon: "🎯",
                        title: "Professional Recognition",
                        description:
                          "Gain industry-recognized certification that validates your expertise.",
                      },
                      {
                        icon: "💼",
                        title: "Career Opportunities",
                        description:
                          "Open doors to new job opportunities and career advancement.",
                      },
                      {
                        icon: "🌍",
                        title: "Global Applicability",
                        description:
                          "Certification recognized and valued worldwide in the field.",
                      },
                      {
                        icon: "📈",
                        title: "Skill Validation",
                        description:
                          "Demonstrate your practical skills and theoretical knowledge.",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="group">
                        <div className="border-primary/20 from-primary/5 to-accent/5 rounded-xl border-2 bg-gradient-to-r p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                          <div className="mb-4 text-4xl">{item.icon}</div>
                          <h3 className="mb-2 text-xl font-semibold">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Reviews Section */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
              <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
                <CardHeader className="pb-6 text-center">
                  <CardTitle className="text-3xl font-bold md:text-4xl">
                    Student Reviews
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Hear from our successful students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {REVIEWS.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                      <StarIcon className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                      <p className="text-muted-foreground text-lg">
                        No reviews yet - be the first!
                      </p>
                    </div>
                  )}

                  <div className="mx-auto max-w-2xl">
                    <ReviewForm />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="from-muted/20 to-background bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
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

      {/* 10. Communities Section */}
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
                <WhatsAppIcon />
                Join WhatsApp Community
              </Link>
              <Link
                href="https://www.instagram.com/channel/AbZNVUaQ3yMrfJGm/?igsh=dTV3MWozOXJsdDFy"
                className="inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 font-semibold text-purple-600 transition-all hover:bg-gray-100 hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
                Follow on Instagram
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <StickyCTA
        price={
          hasValidOffer && offerDetails ? offerDetails.offerPrice : course.price
        }
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
