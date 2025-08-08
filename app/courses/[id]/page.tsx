"use client";

import React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCart } from "react-use-cart";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Id, Doc } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, showRupees } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Plus,
  ShoppingCart,
  Award,
  ClipboardCheck,
  FileText,
  Rocket,
  GraduationCap,
  CircleCheck,
  Star,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function CourseImageGallery({ imageIds }: { imageIds: Array<Id<"_storage">> }) {
  const urls = imageIds.map((id) =>
    useQuery(api.image.getImageUrl, { storageId: id }),
  );

  if (!urls.length) {
    return (
      <div className="bg-muted/40 flex h-80 items-center justify-center rounded-lg">
        <BookOpen className="text-muted-foreground h-10 w-10" />
      </div>
    );
  }

  if (urls.length === 1) {
    return (
      <div className="bg-muted/40 relative h-64 overflow-hidden rounded-lg sm:h-80 md:h-96 lg:h-[28rem]">
        <Image
          src={
            urls[0]?.url ??
            "https://blocks.astratic.com/img/general-img-landscape.png"
          }
          alt="Course image"
          fill
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className="bg-muted/40 relative h-64 overflow-hidden rounded-lg sm:h-80 md:h-96 lg:h-[28rem]">
      <Carousel className="h-full w-full">
        <CarouselContent>
          {urls.map((u, i) => (
            <CarouselItem
              key={i}
              className="flex h-64 items-center justify-center sm:h-80 md:h-96 lg:h-[28rem]"
            >
              {u?.url ? (
                <Image
                  src={u.url}
                  alt={`Course image ${i + 1}`}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen className="text-muted-foreground h-10 w-10" />
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-2 -translate-y-1/2" />
        <CarouselNext className="absolute top-1/2 right-2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
}

function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const displayRating = hoverRating ?? rating;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.floor(displayRating);
        const isHalfFilled =
          starValue === Math.ceil(displayRating) && displayRating % 1 !== 0;

        return (
          <div
            key={i}
            className={cn(
              "relative cursor-pointer transition-transform",
              !readonly && "hover:scale-110",
            )}
            onMouseEnter={() => !readonly && setHoverRating?.(starValue)}
            onMouseLeave={() => !readonly && setHoverRating?.(null)}
            onClick={() => !readonly && onRatingChange?.(starValue)}
          >
            {/* Background star (gray) */}
            <Star
              className={cn(sizeClasses[size], "text-muted-foreground")}
              fill="none"
            />

            {/* Filled portion */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                width: isFilled ? "100%" : isHalfFilled ? "50%" : "0%",
              }}
            >
              <Star
                className={cn(sizeClasses[size], "text-yellow-500")}
                fill="currentColor"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InteractiveStarRating({
  rating,
  onRatingChange,
  size = "md",
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const displayRating = hoverRating ?? rating;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const fullStarValue = i + 1;
        const halfStarValue = i + 0.5;

        return (
          <div key={i} className="relative">
            {/* Background star (gray) */}
            <Star
              className={cn(sizeClasses[size], "text-muted-foreground")}
              fill="none"
            />

            {/* Left half */}
            <div
              className="absolute inset-0 cursor-pointer overflow-hidden transition-transform hover:scale-110"
              style={{ width: "50%" }}
              onMouseEnter={() => setHoverRating(halfStarValue)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => onRatingChange(halfStarValue)}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  displayRating >= halfStarValue
                    ? "text-yellow-500"
                    : "text-transparent",
                )}
                fill="currentColor"
              />
            </div>

            {/* Right half */}
            <div
              className="absolute inset-0 cursor-pointer overflow-hidden transition-transform hover:scale-110"
              style={{ width: "100%", left: "50%" }}
              onMouseEnter={() => setHoverRating(fullStarValue)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => onRatingChange(fullStarValue)}
            >
              <div style={{ transform: "translateX(-50%)" }}>
                <Star
                  className={cn(
                    sizeClasses[size],
                    displayRating >= fullStarValue
                      ? "text-yellow-500"
                      : "text-transparent",
                  )}
                  fill="currentColor"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addItem, inCart } = useCart();
  const course = useQuery(api.courses.getCourseById, {
    id: params.id as unknown as Id<"courses">,
  });

  const related = useQuery(api.courses.listCoursesByType, {
    type: (course?.type as any) ?? "certificate",
  });
  const reviews = useQuery(api.courses.listReviewsForCourse, {
    courseId: params.id as unknown as Id<"courses">,
    count: 6,
  });

  const form = useForm<{ rating: number; content: string }>({
    defaultValues: { rating: 5, content: "" },
  });
  const createReview = useMutation(api.courses.createReview);

  // Shared FAQ markdown file
  const FAQ_FILE_ID: Id<"_storage"> =
    "kg283gx8492r6961qy61a8z5717n77eq" as unknown as Id<"_storage">;
  const faqFile = useQuery(api.image.getImageUrl, { storageId: FAQ_FILE_ID });
  const [faqMarkdown, setFaqMarkdown] = React.useState<string | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!faqFile?.url) return;
      try {
        const res = await fetch(faqFile.url);
        const text = await res.text();
        if (!cancelled) setFaqMarkdown(text);
      } catch {
        if (!cancelled) setFaqMarkdown(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [faqFile?.url]);

  function parseFaqMarkdown(md: string): Array<{ q: string; a: string }> {
    const normalized = md.replace(/\r\n?/g, "\n");
    const lines = normalized.split("\n");
    // 1) Try parsing a two-column markdown table with headers Question | Answer
    const tableItems: Array<{ q: string; a: string }> = [];
    for (let i = 0; i < lines.length - 1; i++) {
      const header = lines[i].trim();
      const separator = lines[i + 1]?.trim() ?? "";
      const isHeaderRow =
        header.includes("|") &&
        /question/i.test(header) &&
        /answer/i.test(header);
      const isSeparatorRow = /^\|?\s*-+\s*\|\s*-+/.test(separator);
      if (isHeaderRow && isSeparatorRow) {
        for (let j = i + 2; j < lines.length; j++) {
          const row = lines[j];
          if (!row.trim().startsWith("|")) break;
          const raw = row.trim().replace(/^\|/, "").replace(/\|$/, "");
          const cols = raw.split("|");
          if (cols.length >= 2) {
            const questionCol = cols[0].trim().replace(/\*\*/g, "");
            const answerCol = cols.slice(1).join("|").trim();
            if (questionCol) {
              tableItems.push({ q: questionCol, a: answerCol });
            }
          }
        }
        break;
      }
    }
    if (tableItems.length > 0) return tableItems;

    // 2) Fallback: use headings as questions (skip generic headings like "Additional Information")
    const items: Array<{ q: string; a: string }> = [];
    let currentQuestion: string | null = null;
    let currentAnswerLines: string[] = [];
    for (const line of lines) {
      const headingMatch = /^(#{2,6})\s+(.+)$/.exec(line.trim());
      if (headingMatch) {
        if (
          currentQuestion &&
          !/^(additional information)$/i.test(currentQuestion.trim())
        ) {
          items.push({
            q: currentQuestion,
            a: currentAnswerLines.join("\n").trim(),
          });
        }
        currentQuestion = headingMatch[2].trim();
        currentAnswerLines = [];
      } else {
        currentAnswerLines.push(line);
      }
    }
    if (
      currentQuestion &&
      !/^(additional information)$/i.test(currentQuestion.trim())
    ) {
      items.push({
        q: currentQuestion,
        a: currentAnswerLines.join("\n").trim(),
      });
    }
    return items;
  }

  // Variant label: prefer `sessions` then `duration` else attempt extraction
  function extractVariantLabel(c: Doc<"courses">): string | null {
    if (typeof (c as any).sessions === "number") {
      const count = (c as any).sessions as number;
      return `${count} ${count === 1 ? "session" : "sessions"}`;
    }
    const duration = (c as any).duration as string | undefined;
    if (typeof duration === "string" && duration.trim().length > 0) {
      return duration.trim();
    }
    const candidates = [c.name, c.description ?? "", c.content];
    for (const text of candidates) {
      if (!text) continue;
      const match = text.match(/(\d+)\s*(session|sessions)\b/i);
      if (match) {
        const count = Number(match[1]);
        return `${count} ${count === 1 ? "session" : "sessions"}`;
      }
    }
    return null;
  }

  const variants: Array<Doc<"courses">> = React.useMemo(() => {
    if (!course) return [] as Array<Doc<"courses">>;
    const all = related?.courses ?? [];
    const sameName = all.filter((c) => c.name === course.name);
    // Ensure current course is included
    const base =
      sameName.length > 0 ? sameName : [course as unknown as Doc<"courses">];
    // Sort by price ascending for readability
    return [...base].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  }, [related, course]);

  const useSessionsMode =
    variants.length > 0 &&
    variants.every((c) => typeof (c as any).sessions === "number");
  const useDurationMode =
    !useSessionsMode &&
    variants.length > 0 &&
    variants.every(
      (c) => typeof (c as any).duration === "string" && !!(c as any).duration,
    );
  const [selectedId, setSelectedId] = React.useState<Id<"courses"> | null>(
    null,
  );
  const [selectedSessions, setSelectedSessions] = React.useState<number | null>(
    null,
  );
  const [selectedDuration, setSelectedDuration] = React.useState<string | null>(
    null,
  );
  const selectedCourse: Doc<"courses"> | null = React.useMemo(() => {
    if (!course) return null;
    if (useSessionsMode) {
      const targetCount =
        selectedSessions ??
        ((variants[0] as any).sessions as number | undefined) ??
        (course.sessions as number | undefined) ??
        null;
      if (targetCount != null) {
        return (
          variants.find((c) => (c as any).sessions === targetCount) ??
          (course as unknown as Doc<"courses">)
        );
      }
      return course as unknown as Doc<"courses">;
    }
    if (useDurationMode) {
      const targetDuration =
        selectedDuration ??
        ((variants[0] as any).duration as string | undefined) ??
        ((course as any).duration as string | undefined) ??
        null;
      if (targetDuration != null) {
        return (
          variants.find((c) => (c as any).duration === targetDuration) ??
          (course as unknown as Doc<"courses">)
        );
      }
      return course as unknown as Doc<"courses">;
    }
    const targetId = selectedId ?? (course._id as Id<"courses">);
    return (
      variants.find((c) => c._id === targetId) ??
      (course as unknown as Doc<"courses">)
    );
  }, [course, variants, selectedId, selectedSessions, useSessionsMode]);

  const displayCourse: Doc<"courses"> | null =
    selectedCourse ?? (course as unknown as Doc<"courses">);

  function parseUTCDateOnly(dateStr: string): Date | null {
    const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
    const m = isoDateOnly.exec(dateStr);
    if (m) {
      const [, y, mo, d] = m;
      const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
      return date;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  function getOrdinal(n: number): string {
    const rem10 = n % 10;
    const rem100 = n % 100;
    if (rem100 >= 11 && rem100 <= 13) return "th";
    if (rem10 === 1) return "st";
    if (rem10 === 2) return "nd";
    if (rem10 === 3) return "rd";
    return "th";
  }

  function formatDateCommon(dateStr: string): string {
    const d = parseUTCDateOnly(dateStr);
    if (!d) return dateStr;
    const day = d.getUTCDate();
    const month = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
    const year = d.getUTCFullYear();
    return `${day}${getOrdinal(day)} ${month} ${year}`;
  }

  function StructuredContent({ text }: { text: string }) {
    // Split into blocks by one or more blank lines
    const blocks = text.replace(/\r\n?/g, "\n").split(/\n{2,}/);
    return (
      <div className="space-y-4">
        {blocks.map((block, idx) => {
          const lines = block
            .split(/\n/)
            .map((l) => l.trim())
            .filter(Boolean);
          const isBulleted = lines.every((l) => /^[-*•]\s+/.test(l));
          const isNumbered = lines.every((l) => /^\d+[\.)]\s+/.test(l));
          if (isBulleted) {
            return (
              <ul
                key={idx}
                className="marker:text-muted-foreground list-disc space-y-1 pl-6"
              >
                {lines.map((l, i) => (
                  <li key={i}>{l.replace(/^[-*•]\s+/, "")}</li>
                ))}
              </ul>
            );
          }
          if (isNumbered) {
            return (
              <ol
                key={idx}
                className="marker:text-muted-foreground list-decimal space-y-1 pl-6"
              >
                {lines.map((l, i) => (
                  <li key={i}>{l.replace(/^\d+[\.)]\s+/, "")}</li>
                ))}
              </ol>
            );
          }
          // Default paragraph with preserved line breaks
          return (
            <p key={idx} className="leading-relaxed whitespace-pre-wrap">
              {block}
            </p>
          );
        })}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="section-padding container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-2">Loading...</h1>
          <p className="text-muted-foreground">Fetching course details.</p>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: course.price,
      imageUrls: course.imageUrls ?? [],
      capacity: course.capacity ?? 1,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding from-primary/5 via-background to-accent/5 bg-gradient-to-br">
        <div className="container">
          {/* Breadcrumb */}
          <div className="text-muted-foreground mb-6 text-sm">
            <Link href="/courses" className="hover:text-foreground">
              Courses
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{course.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <CourseImageGallery
                imageIds={(course.imageUrls ?? []) as Array<Id<"_storage">>}
              />
            </div>
            <div className="flex flex-col gap-6 lg:sticky lg:top-24">
              {(() => {
                const seatsLeft = Math.max(
                  0,
                  (course.capacity ?? 0) - (course.enrolledUsers?.length ?? 0),
                );
                if (seatsLeft > 0 && seatsLeft <= 5) {
                  return (
                    <Badge variant="default" className="w-fit">
                      Limited seats: {seatsLeft} left
                    </Badge>
                  );
                }
                if (seatsLeft === 0) {
                  return (
                    <Badge variant="secondary" className="w-fit">
                      Waitlist
                    </Badge>
                  );
                }
                return null;
              })()}
              <div>
                <h1 className="mb-2">{course.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  {course.type ?? "Course"}
                </Badge>
                {(() => {
                  const sess =
                    (displayCourse as any)?.sessions ?? course.sessions;
                  return sess ? (
                    <Badge className="text-sm">{sess} sessions</Badge>
                  ) : null;
                })()}
                {Number.isFinite(course.capacity ?? 0) && (
                  <Badge className="text-sm">Capacity: {course.capacity}</Badge>
                )}
              </div>
              {/* Purchase panel */}
              <Card className="card-shadow">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <span className="text-primary text-3xl font-bold">
                      {showRupees(
                        (
                          selectedCourse ??
                          (course as unknown as Doc<"courses">)
                        ).price,
                      )}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      {useSessionsMode ? (
                        <Select
                          value={String(
                            selectedSessions ??
                              (selectedCourse as any)?.sessions ??
                              course.sessions ??
                              "",
                          )}
                          onValueChange={(val) =>
                            setSelectedSessions(parseInt(val, 10))
                          }
                        >
                          <SelectTrigger className="w-full sm:w-56">
                            <SelectValue placeholder="Select sessions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Sessions</SelectLabel>
                              {variants.map((v) => {
                                const count = (v as any).sessions as number;
                                const label = `${count} ${count === 1 ? "session" : "sessions"}`;
                                return (
                                  <SelectItem key={v._id} value={String(count)}>
                                    {label} — {showRupees(v.price)}
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : useDurationMode ? (
                        <Select
                          value={
                            (selectedDuration ??
                              ((selectedCourse as any)?.duration as string) ??
                              ((course as any).duration as string) ??
                              "") as string
                          }
                          onValueChange={(val) => setSelectedDuration(val)}
                        >
                          <SelectTrigger className="w-full sm:w-56">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Duration</SelectLabel>
                              {variants.map((v) => {
                                const duration = (v as any).duration as string;
                                const label = duration?.trim() ?? "Duration";
                                return (
                                  <SelectItem key={v._id} value={duration}>
                                    {label} — {showRupees(v.price)}
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : (
                        variants.length > 1 && (
                          <Select
                            value={
                              (selectedCourse?._id ??
                                course._id) as unknown as string
                            }
                            onValueChange={(val) =>
                              setSelectedId(val as unknown as Id<"courses">)
                            }
                          >
                            <SelectTrigger className="w-full sm:w-56">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Options</SelectLabel>
                                {variants.map((v, idx) => {
                                  const extracted = extractVariantLabel(v);
                                  const label =
                                    extracted ?? `Option ${idx + 1}`;
                                  return (
                                    <SelectItem
                                      key={v._id}
                                      value={v._id as unknown as string}
                                    >
                                      {label} — {showRupees(v.price)}
                                    </SelectItem>
                                  );
                                })}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      onClick={() => {
                        const c =
                          selectedCourse ??
                          (course as unknown as Doc<"courses">);
                        addItem({
                          id: c._id,
                          name: c.name,
                          description: c.description,
                          price: c.price,
                          imageUrls: c.imageUrls ?? [],
                          capacity: c.capacity ?? 1,
                        });
                      }}
                      disabled={inCart(
                        (
                          selectedCourse ??
                          (course as unknown as Doc<"courses">)
                        )._id,
                      )}
                      className="transition-smooth w-full hover:scale-[1.02] sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      {inCart(
                        (
                          selectedCourse ??
                          (course as unknown as Doc<"courses">)
                        )._id,
                      )
                        ? "Added"
                        : "Add to cart"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const c =
                          selectedCourse ??
                          (course as unknown as Doc<"courses">);
                        if (!inCart(c._id)) {
                          addItem({
                            id: c._id,
                            name: c.name,
                            description: c.description,
                            price: c.price,
                            imageUrls: c.imageUrls ?? [],
                            capacity: c.capacity ?? 1,
                          });
                        }
                        router.push("/cart");
                      }}
                      className="transition-smooth w-full hover:scale-[1.02] sm:w-auto"
                    >
                      <ShoppingCart className="h-4 w-4" /> Buy now
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
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              {/* Back plate for 3D illusion */}
              <div className="pointer-events-none absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-none border-2 border-blue-800 bg-blue-300" />
              {/* Foreground outlined card */}
              <Card className="card-shadow hover:card-shadow-lg transition-smooth rounded-none border-[3px] border-blue-900 bg-blue-50 hover:-translate-y-0.5">
                <CardHeader className="items-center text-center">
                  <CardTitle className="font-serif text-4xl font-semibold text-blue-950 md:text-5xl">
                    Course Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral dark:prose-invert mx-auto text-center font-serif">
                    <StructuredContent
                      text={course.description ?? "Details coming soon."}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Topics to be covered (two-column checklist with 3D frame) */}
            <div className="relative mt-10">
              <div className="pointer-events-none absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-none border-2 border-blue-800 bg-blue-300" />
              <Card className="rounded-none border-[3px] border-blue-900 bg-blue-50">
                <CardHeader className="items-center p-6 text-center md:p-8">
                  <CardTitle className="text-3xl font-semibold text-blue-950 md:text-4xl">
                    Topics to be covered in{" "}
                    {(displayCourse as any)?.sessions ?? course.sessions ?? 0}{" "}
                    hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid gap-px border-t-2 border-blue-900 md:grid-cols-2">
                    {[
                      "Nature & Meaning of I-O Psychology",
                      "Organizational Attitude",
                      "Group Behavior & Work Teams, Group Formation & Development",
                      "Organization Design, Structural Differentiation, Forces Re-Shaping the Organization",
                      "Role of I-O Psychology",
                      "Motivation & Work Behavior, Cultural Difference in Motivation",
                      "Individual & Group Decision Making Process",
                      "Leadership & Management, Leadership Theories, Emerging Issues in Leadership",
                    ].map((topic, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 border-b-2 border-blue-900 p-4 last:border-b-0 md:border-r-2 md:last:border-r-0"
                      >
                        <CircleCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-900" />
                        <p className="text-blue-950/90">{topic}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Perks / Benefits */}
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
            {[
              {
                title: "Internship Certificate",
                desc: "A mark of your specialized training.",
                Icon: Award,
              },
              {
                title: "Weekly Assessment",
                desc: "Continual feedback to sharpen your skills.",
                Icon: ClipboardCheck,
              },
              {
                title: "Resource Material",
                desc: "Curated resources for deeper learning.",
                Icon: FileText,
              },
              {
                title: "Experiential Learning",
                desc: "Hands-on projects and case work.",
                Icon: GraduationCap,
              },
            ].map(({ title, desc, Icon }) => (
              <Card
                key={title}
                className="card-shadow hover:card-shadow-lg transition-smooth from-primary/5 to-accent/5 bg-gradient-to-br hover:-translate-y-0.5"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="text-primary h-5 w-5" />}
                    <CardTitle className="text-base">{title}</CardTitle>
                  </div>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mx-auto max-w-3xl">
            {/* Evaluation parameters */}
            <Card className="card-shadow hover:card-shadow-lg transition-smooth mt-8 hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle>Evaluation Parameters</CardTitle>
                <CardDescription>How your progress is assessed</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="marker:text-muted-foreground list-disc space-y-1 pl-6 text-sm">
                  <li>Attendance - 5 marks</li>
                  <li>Class Participation - 15 marks</li>
                  <li>Class assignments and activities - 30 marks</li>
                  <li>Viva / Quiz - 10 marks</li>
                  <li>Written assessment / Report making - 40 marks</li>
                </ul>
              </CardContent>
            </Card>

            {/* Suitability section */}
            <Card className="card-shadow hover:card-shadow-lg transition-smooth mt-8 hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle>This programme is suitable if:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="marker:text-muted-foreground list-disc space-y-2 pl-6 text-sm">
                  <li>
                    You're an aspiring practitioner seeking practical,
                    supervised experience
                  </li>
                  <li>
                    You're a business/HR professional applying psychology-driven
                    strategies
                  </li>
                  <li>
                    You're a researcher keen on real-world organizational
                    dynamics
                  </li>
                  <li>
                    You're a career-changer exploring applied psychology in
                    workplaces
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* FAQs section using shared markdown file */}
            <Card className="card-shadow mt-8">
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
                          <AccordionItem key={idx} value={`item-${idx + 1}`}>
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

      {/* Related */}
      {related?.courses && related.courses.length > 1 && (
        <section className="bg-muted/30 py-12">
          <div className="container">
            <h2 className="mb-6 text-2xl font-semibold">You might also like</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.courses
                .filter((c) => c._id !== course._id)
                .map((c) => (
                  <Card
                    key={c._id}
                    className="card-shadow hover:card-shadow-lg transition-smooth cursor-pointer hover:-translate-y-0.5"
                    onClick={() => router.push(`/courses/${c._id}`)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{c.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {c.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <Badge variant="secondary">{showRupees(c.price)}</Badge>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem({
                            id: c._id,
                            name: c.name,
                            description: c.description,
                            price: c.price,
                            imageUrls: c.imageUrls ?? [],
                            capacity: c.capacity ?? 1,
                          });
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="section-padding">
        <div className="container">
          <h2 className="mb-6 text-2xl font-semibold">What learners say</h2>
          {reviews && reviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <Card key={r._id} className="card-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <StarRating rating={r.rating} readonly size="sm" />
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

      {/* Review form */}
      <section className="section-padding pt-0">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Leave a review</CardTitle>
                <CardDescription>
                  Share your experience with this course.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(async (values) => {
                      try {
                        await createReview({
                          courseId: params.id as unknown as Id<"courses">,
                          rating: Number(values.rating),
                          content: values.content,
                        });
                        form.reset({ rating: 5, content: "" });
                      } catch (e) {
                        console.error(e);
                      }
                    })}
                  >
                    {/* Star rating input */}
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating</FormLabel>
                          <div className="flex items-center gap-2">
                            <InteractiveStarRating
                              rating={Number(field.value ?? 0)}
                              onRatingChange={field.onChange}
                            />
                            <span className="text-muted-foreground text-sm">
                              {Number(field.value ?? 0).toFixed(1)} / 5
                            </span>
                          </div>
                          <FormDescription>
                            Select a rating from 0.5 to 5.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Review text */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What did you like?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button type="submit">Submit review</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
