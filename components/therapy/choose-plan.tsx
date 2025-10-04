"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  HeartHandshake,
  Flame,
} from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import type { Doc } from "@/convex/_generated/dataModel";

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
  gradient: string;
  icon: React.ReactNode;
  description: string;
};

interface ChoosePlanProps {
  course: Doc<"courses">;
  variants: Doc<"courses">[];
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
  const { ref, visible } = useInView<HTMLDivElement>();
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
    // Create Express plan (affordable)
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
      perSession: {}, // Will be populated from variants
      validityDays: {}, // Will be populated from variants
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      icon: <HeartHandshake className="h-6 w-6" />,
    };

    // Create Spark plan (starter)
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
      perSession: {}, // Will be populated from variants
      validityDays: {}, // Will be populated from variants
      gradient: "from-rose-500 via-orange-500 to-amber-500",
      icon: <Flame className="h-6 w-6" />,
    };

    // Create Connection plan (premium)
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
      perSession: {}, // Will be populated from variants
      validityDays: {}, // Will be populated from variants
      gradient: "from-blue-600 via-purple-600 to-indigo-700",
      icon: <Sparkles className="h-6 w-6" />,
    };

    // Extract base prices per session from variants (total price divided by session count)
    const basePrices: Record<number, number> = {};
    const validityDays: Record<number, number> = {};

    variants.forEach((variant) => {
      const sessionCount = variant.sessions;
      if (sessionCount && typeof sessionCount === "number") {
        // Calculate price per session (total price divided by number of sessions)
        const pricePerSession = Math.round(variant.price / sessionCount);
        basePrices[sessionCount] = pricePerSession;
        // Set validity days based on session count
        validityDays[sessionCount] =
          sessionCount === 1 ? 10 : sessionCount * 30;
      }
    });

    // Set prices for each plan using the correct ratios for each session count
    Object.keys(basePrices).forEach((sessionCount) => {
      const count = parseInt(sessionCount);

      // Spark plan (base price)
      sparkPlan.perSession[count] = basePrices[count];
      sparkPlan.validityDays[count] = validityDays[count];

      // Express plan (calculated based on actual ratios)
      expressPlan.perSession[count] = calculatePlanPrice(
        basePrices[count],
        count,
        "express",
      );
      expressPlan.validityDays[count] = validityDays[count];

      // Connection plan (calculated based on actual ratios)
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
    // Find the correct course variant based on sessions
    const selectedVariant = variants.find((variant) => {
      const variantSessions = variant.sessions;
      return variantSessions === sessions;
    });

    if (!selectedVariant) {
      console.error("No variant found for sessions:", sessions);
      return;
    }

    // Check if course is out of stock
    const seatsLeft = Math.max(
      0,
      (selectedVariant.capacity ?? 0) -
        (selectedVariant.enrolledUsers?.length ?? 0),
    );
    const isOutOfStock =
      (selectedVariant.capacity ?? 0) === 0 || seatsLeft === 0;

    if (isOutOfStock) {
      console.error("Course is out of stock");
      return;
    }

    // Create a descriptive name for the cart item
    const planName =
      planId === "connection"
        ? "Connection"
        : planId === "spark"
          ? "Spark"
          : "Express";
    const cartItemName = `${selectedVariant.name} - ${planName} (${sessions} ${sessions === 1 ? "session" : "sessions"})`;

    // Add to cart
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
    });

    // Call the original onBook callback
    onBook({
      planId,
      sessions,
      total,
      perSession,
    });

    // Navigate to cart
    router.push("/cart");
  };

  return (
    <section id="plans" className="scroll-mt-24">
      <div className="relative overflow-hidden dark:text-white">
        {/* Enhanced background with gradients */}
        <div className="from-background via-muted/20 to-background absolute inset-0 bg-gradient-to-br dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950" />

        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float-slow absolute -top-20 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 blur-3xl dark:from-blue-700/15 dark:to-purple-800/15" />
          <div className="animate-float-slower absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-600/20 blur-3xl dark:from-emerald-700/15 dark:to-cyan-700/15" />
          <div className="animate-float-medium absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-pink-500/10 to-rose-600/10 blur-2xl dark:from-pink-700/10 dark:to-rose-800/10" />
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="mb-12 text-center">
            <div className="from-primary/10 to-accent/10 border-primary/20 mb-4 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-4 py-2">
              <Sparkles className="text-primary h-4 w-4" />
              <span className="text-primary text-sm font-medium">
                Choose Your Therapy Plan
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Begin Your{" "}
              <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                Wellness Journey
              </span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Select the number of sessions that work best for you. You can
              always add more later.
            </p>

            {/* Enhanced Session selector */}
            <div className="from-muted/50 to-muted/30 border-border/50 mt-8 inline-flex items-center justify-center gap-3 rounded-2xl border bg-gradient-to-r p-2 shadow-lg backdrop-blur-sm">
              {sessionOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSessions(opt)}
                  aria-pressed={sessions === opt}
                  className={cn(
                    "min-w-[100px] rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300",
                    sessions === opt
                      ? "from-primary to-accent shadow-primary/25 scale-105 transform bg-gradient-to-r text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
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

          {/* Enhanced Plan cards */}
          <div
            ref={ref}
            className={cn(
              "mx-auto grid max-w-5xl gap-8 md:grid-cols-3",
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              "transition-all duration-700",
            )}
          >
            {plans.map((plan) => {
              const per = plan.perSession[sessions];
              // Skip rendering if no pricing available for this session count
              if (!per) return null;

              const total = per * sessions;
              const billed =
                sessions === 1
                  ? `Billed for ${sessions} session at ₹${formatter.format(total)}`
                  : `Billed for ${sessions} sessions at ₹${formatter.format(total)}`;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "from-card to-card/80 group relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br shadow-2xl transition-all duration-500 will-change-transform",
                    "hover:shadow-3xl hover:shadow-primary/10 hover:-translate-y-2",
                    "backdrop-blur-sm",
                  )}
                >
                  {/* Gradient overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-5",
                      plan.gradient,
                    )}
                  />

                  {/* Glow effect */}
                  <div
                    className={cn(
                      "absolute -inset-1 rounded-3xl bg-gradient-to-br opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20",
                      plan.gradient,
                    )}
                  />

                  {/* Plan header with gradient */}
                  <CardHeader className="relative pb-6">
                    <div
                      className={cn(
                        "absolute inset-0 rounded-t-3xl bg-gradient-to-r opacity-10",
                        plan.gradient,
                      )}
                    />
                    <div className="relative flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                          plan.gradient,
                        )}
                      >
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative pb-6">
                    <ul className="mb-6 grid gap-3 text-sm">
                      {plan.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-3">
                          <div className="from-primary/20 to-accent/20 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r">
                            <CheckCircle2 className="text-primary h-3 w-3" />
                          </div>
                          <span className="text-muted-foreground">{h}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-4">
                      <div className="flex items-baseline gap-3">
                        <div className="from-primary to-accent bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
                          ₹{formatter.format(per)}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          per session
                        </div>
                      </div>
                      <div className="text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 text-xs">
                        {billed}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="relative flex items-center justify-between gap-4 pt-0">
                    <div className="text-muted-foreground bg-muted/30 rounded-full px-3 py-1 text-xs">
                      Valid for {plan.validityDays[sessions] || 30} days
                    </div>
                    <Button
                      className={cn(
                        "rounded-xl bg-gradient-to-r font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl",
                        plan.gradient,
                      )}
                      onClick={() =>
                        handleStartSession(plan.id, sessions, total, per)
                      }
                    >
                      Start Session
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        <style jsx>{`
          @keyframes float-slow {
            0%,
            100% {
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            33% {
              transform: translateY(-20px) translateX(10px) rotate(2deg);
            }
            66% {
              transform: translateY(10px) translateX(-15px) rotate(-1deg);
            }
          }
          @keyframes float-slower {
            0%,
            100% {
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-30px) translateX(20px) rotate(5deg);
            }
          }
          @keyframes float-medium {
            0%,
            100% {
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
            }
          }
          .animate-float-slow {
            animation: float-slow 12s ease-in-out infinite;
          }
          .animate-float-slower {
            animation: float-slower 15s ease-in-out infinite;
          }
          .animate-float-medium {
            animation: float-medium 10s ease-in-out infinite;
          }
        `}</style>
      </div>
    </section>
  );
}
