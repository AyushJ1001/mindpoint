"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock, BookOpen, Award } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

function parseUTCDateOnly(dateStr: string): Date | null {
  // First try to parse as ISO format (YYYY-MM-DD)
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const match = isoDate.exec(dateStr);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1; // Month is 0-indexed
    const day = Number(match[3]);
    return new Date(Date.UTC(year, month, day));
  }

  // Fallback to standard Date parsing
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
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);
  return { ref, isVisible } as const;
}

interface CountdownTimerProps {
  course: {
    startDate: string;
    endDate?: string;
    duration?: string;
    startTime: string;
    endTime: string;
    price: number;
    type?: string;
  };
  customDuration?: string;
}

export default function CountdownTimer({
  course,
  customDuration,
}: CountdownTimerProps) {
  const statsAnimation = useScrollAnimation();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const parsedDate = parseUTCDateOnly(course.startDate);
      if (!parsedDate) {
        console.error("Invalid date format:", course.startDate);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const now = new Date();
      const diff = parsedDate.getTime() - now.getTime();
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

  return (
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
              <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                Course Highlights
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know at a glance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
            {[
              {
                label: "Start Date",
                value: formatDateCommon(course.startDate),
                icon: Calendar,
              },
              ...(course.type === "certificate" && course.endDate
                ? [
                    {
                      label: "End Date",
                      value: formatDateCommon(course.endDate),
                      icon: Calendar,
                    },
                  ]
                : []),
              {
                label: "Duration",
                value: course.duration || customDuration || "2 weeks",
                icon: Clock,
              },
              {
                label: "Time Slot (IST)",
                value: `${course.startTime} - ${course.endTime}`,
                icon: Clock,
              },
              {
                label: "Language",
                value: (
                  <span>
                    English
                    <hr className="border-muted-foreground mx-auto my-1 border-dotted opacity-50" />
                    Hindi (if requested)
                  </span>
                ),
                icon: BookOpen,
              },
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
              <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                Course Starting In
              </span>
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
  );
}
