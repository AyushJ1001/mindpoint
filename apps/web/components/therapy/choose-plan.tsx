"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Sparkles,
  HeartHandshake,
  Flame,
} from "lucide-react";
import type { PublicCourse } from "@mindpoint/backend";
import { getEnrolledCount } from "@/lib/course-enrollment";
import { ScrollReveal } from "@/components/ScrollReveal";

// Configuration constants
// Based on the actual pricing table:
// Spark: 1 session ₹600, 3 sessions ₹1650, 6 sessions ₹3000
// Express: 1 session ₹950, 3 sessions ₹2700, 6 sessions ₹5100
// Connection: 1 session ₹1400, 3 sessions ₹4050, 6 sessions ₹7800

// Calculate the correct price for each plan based on actual ratios
const calculatePlanPrice = (
  basePrice: number,
  sessionCount: number,
  planId: string,
): number => {
  // Define the actual price ratios for each session count
  const priceRatios = {
    1: { express: 950 / 600, connection: 1400 / 600 },
    3: { express: 2700 / 1650, connection: 4050 / 1650 },
    6: { express: 5100 / 3000, connection: 7800 / 3000 },
  };

  if (planId === "spark") {
    return basePrice; // Spark uses base price
  } else if (planId === "express") {
    const ratio =
      priceRatios[sessionCount as keyof typeof priceRatios]?.express;
    return ratio ? Math.round(basePrice * ratio) : basePrice;
  } else if (planId === "connection") {
    const ratio =
      priceRatios[sessionCount as keyof typeof priceRatios]?.connection;
    return ratio ? Math.round(basePrice * ratio) : basePrice;
  }

  return basePrice;
};

type Sessions = number;

type Plan = {
  id: "spark" | "connection" | "express";
  name: string;
  highlights: string[];
  perSession: Record<number, number>;
  validityDays: Record<number, number>;
  icon: React.ReactNode;
  description: string;
};

interface ChoosePlanProps {
  course: PublicCourse;
  variants: PublicCourse[];
  onBook?: (payload: {
    planId: string;
    sessions: Sessions;
    total: number;
    perSession: number;
  }) => void;
}

export default function ChoosePlan({
  variants,
  onBook = () => {},
}: ChoosePlanProps) {
  const { addItem } = useCart();
  const router = useRouter();

  // Get unique session counts from variants
  const sessionOptions = useMemo(() => {
    const sessionCounts = new Set<number>();
    variants.forEach((variant) => {
      const sessionCount = variant.sessions;
      if (sessionCount && typeof sessionCount === "number") {
        sessionCounts.add(sessionCount);
      }
    });
    // Fallback to default options if no variants found
    if (sessionCounts.size === 0) {
      sessionCounts.add(1);
      sessionCounts.add(3);
      sessionCounts.add(6);
    }
    return Array.from(sessionCounts).sort((a, b) => a - b);
  }, [variants]);

  const [sessions, setSessions] = useState<Sessions>(sessionOptions[0] || 1);

  // Create plans from database variants
  const plans: Plan[] = useMemo(() => {
    const sparkPlan: Plan = {
      id: "spark",
      name: "Spark",
      description: "Starter plan to begin your journey",
      highlights: [
        "Low commitment option for those who want to try therapy",
        "Convenient and flexible for busy schedules",
        "Great for follow up sessions",
        "Session duration ~20 mins",
      ],
      perSession: {},
      validityDays: {},
      icon: <Flame className="h-5 w-5" />,
    };

    const expressPlan: Plan = {
      id: "express",
      name: "Express",
      description: "Quick therapy at affordable rates",
      highlights: [
        "A balanced option for those seeking to address a specific concern",
        "Suitable for stress, anxiety, or situational challenges",
        "Provides practical coping tools and short term support",
        "Session duration ~30 to 35 mins",
      ],
      perSession: {},
      validityDays: {},
      icon: <HeartHandshake className="h-5 w-5" />,
    };

    const connectionPlan: Plan = {
      id: "connection",
      name: "Connection",
      description: "Premium therapy with senior experts",
      highlights: [
        "Ideal for ongoing therapy and complex issues",
        "In depth comprehensive counselling",
        "Builds lasting therapeutic relationship and progress",
        "Session duration ~50 mins",
      ],
      perSession: {},
      validityDays: {},
      icon: <Sparkles className="h-5 w-5" />,
    };

    // Extract base prices per session from variants
    const basePrices: Record<number, number> = {};
    const validityDays: Record<number, number> = {};

    variants.forEach((variant) => {
      const sessionCount = variant.sessions;
      if (sessionCount && typeof sessionCount === "number") {
        const pricePerSession = Math.round(variant.price / sessionCount);
        basePrices[sessionCount] = pricePerSession;
        validityDays[sessionCount] =
          sessionCount === 1 ? 10 : sessionCount * 30;
      }
    });

    // Set prices for each plan using the correct ratios
    Object.keys(basePrices).forEach((sessionCount) => {
      const count = parseInt(sessionCount);

      sparkPlan.perSession[count] = basePrices[count];
      sparkPlan.validityDays[count] = validityDays[count];

      expressPlan.perSession[count] = calculatePlanPrice(
        basePrices[count],
        count,
        "express",
      );
      expressPlan.validityDays[count] = validityDays[count];

      connectionPlan.perSession[count] = calculatePlanPrice(
        basePrices[count],
        count,
        "connection",
      );
      connectionPlan.validityDays[count] = validityDays[count];
    });

    return [sparkPlan, expressPlan, connectionPlan];
  }, [variants]);

  const formatter = new Intl.NumberFormat("en-IN");

  const handleStartSession = (
    planId: string,
    sessions: Sessions,
    total: number,
    perSession: number,
  ) => {
    const selectedVariant = variants.find((variant) => {
      const variantSessions = variant.sessions;
      return variantSessions === sessions;
    });

    if (!selectedVariant) {
      console.error("No variant found for sessions:", sessions);
      return;
    }

    const seatsLeft = Math.max(
      0,
      (selectedVariant.capacity ?? 0) - getEnrolledCount(selectedVariant),
    );
    const isOutOfStock =
      (selectedVariant.capacity ?? 0) === 0 || seatsLeft === 0;

    if (isOutOfStock) {
      console.error("Course is out of stock");
      return;
    }

    const planName =
      planId === "connection"
        ? "Connection"
        : planId === "spark"
          ? "Spark"
          : "Express";
    const cartItemName = `${selectedVariant.name} - ${planName} (${sessions} ${sessions === 1 ? "session" : "sessions"})`;

    addItem({
      id: selectedVariant._id,
      name: cartItemName,
      description: selectedVariant.description,
      price: total,
      imageUrls: selectedVariant.imageUrls || [],
      capacity: selectedVariant.capacity || 1,
      quantity: 1,
      offer: selectedVariant.offer,
      bogo: selectedVariant.bogo,
      courseType: selectedVariant.type,
    });

    onBook({ planId, sessions, total, perSession });
    router.push("/cart");
  };

  return (
    <section id="plans" className="section-padding scroll-mt-24">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              Choose the level of support that feels right.
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-lg">
              Select the number of sessions that work best for you. You can
              always add more later.
            </p>

            {/* Session selector */}
            <div className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-1.5">
              {sessionOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSessions(opt)}
                  aria-pressed={sessions === opt}
                  className={cn(
                    "min-w-[90px] rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300",
                    sessions === opt
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <span className="font-semibold">{opt}</span>{" "}
                  <span className="opacity-80">
                    {opt === 1 ? "session" : "sessions"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Plan cards */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const per = plan.perSession[sessions];
            if (!per) return null;

            const total = per * sessions;
            const billed =
              sessions === 1
                ? `Billed for ${sessions} session at ₹${formatter.format(total)}`
                : `Billed for ${sessions} sessions at ₹${formatter.format(total)}`;

            return (
              <ScrollReveal key={plan.id}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  {/* Header */}
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {plan.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <ul className="mb-6 flex-1 space-y-3 text-sm">
                    {plan.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Pricing */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground text-3xl font-semibold">
                        ₹{formatter.format(per)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        per session
                      </span>
                    </div>
                    <div className="text-muted-foreground rounded-lg bg-muted/50 px-3 py-2 text-xs">
                      {billed}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground text-xs">
                      Valid for {plan.validityDays[sessions] || 30} days
                    </span>
                    <Button
                      onClick={() =>
                        handleStartSession(plan.id, sessions, total, per)
                      }
                    >
                      Begin with {plan.name}
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
