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
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import type { Doc } from "@/convex/_generated/dataModel";

// Configuration constants
// Based on the actual pricing table:
// Focus: 1 session ₹800, 2 sessions ₹1500, 4 sessions ₹2800, 6 sessions ₹3900
// Flow: 1 session ₹1100, 2 sessions ₹2100, 4 sessions ₹4000, 6 sessions ₹5700
// Elevate: 1 session ₹1500, 2 sessions ₹2900, 4 sessions ₹5600, 6 sessions ₹8100

// Calculate the correct price for each plan based on actual ratios
const calculateSupervisedPlanPrice = (
  basePrice: number,
  sessionCount: number,
  planId: string,
): number => {
  // Define the actual price ratios for each session count
  const priceRatios = {
    1: { flow: 1100 / 800, elevate: 1500 / 800 },
    2: { flow: 2100 / 1500, elevate: 2900 / 1500 },
    4: { flow: 4000 / 2800, elevate: 5600 / 2800 },
    6: { flow: 5700 / 3900, elevate: 8100 / 3900 },
  };

  if (planId === "focus") {
    return basePrice; // Focus uses base price
  } else if (planId === "flow") {
    const ratio = priceRatios[sessionCount as keyof typeof priceRatios]?.flow;
    return ratio ? Math.round(basePrice * ratio) : basePrice;
  } else if (planId === "elevate") {
    const ratio =
      priceRatios[sessionCount as keyof typeof priceRatios]?.elevate;
    return ratio ? Math.round(basePrice * ratio) : basePrice;
  }

  return basePrice;
};

type Sessions = number;

type Plan = {
  id: "focus" | "flow" | "elevate";
  name: string;
  highlights: string[];
  perSession: Record<number, number>;
  validityDays: Record<number, number>;
  gradient: string;
  icon: React.ReactNode;
  description: string;
};

interface ChooseSupervisedPlanProps {
  course: Doc<"courses">;
  variants: Doc<"courses">[];
  onBook?: (payload: {
    planId: string;
    sessions: Sessions;
    total: number;
    perSession: number;
  }) => void;
}

export default function ChooseSupervisedPlan({
  variants,
  onBook,
}: ChooseSupervisedPlanProps) {
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
      sessionCounts.add(2);
      sessionCounts.add(4);
      sessionCounts.add(6);
    }
    return Array.from(sessionCounts).sort((a, b) => a - b);
  }, [variants]);

  const [sessions, setSessions] = useState<Sessions>(sessionOptions[0] || 1);

  // Create plans from database variants
  const plans: Plan[] = useMemo(() => {
    // Create Focus plan (base)
    const focusPlan: Plan = {
      id: "focus",
      name: "Focus",
      description: "Essential supervised learning",
      highlights: [
        "Targeted supervision for specific skill development",
        "Practical, concise feedback to improve therapy techniques",
        "Ideal for students and early career therapists",
        "Session duration ~40 mins",
      ],
      perSession: {}, // Will be populated from variants
      validityDays: {}, // Will be populated from variants
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      icon: <Target className="h-6 w-6" />,
    };

    // Create Flow plan (enhanced)
    const flowPlan: Plan = {
      id: "flow",
      name: "Flow",
      description: "Enhanced learning experience",
      highlights: [
        "Comprehensive supervision with detailed feedback",
        "Supports deepening therapeutic skills and session management",
        "Enhance client handling and therapeutic effectiveness",
        "Session duration ~60 mins",
      ],
      perSession: {}, // Will be populated from variants
      validityDays: {}, // Will be populated from variants
      gradient: "from-blue-500 via-indigo-500 to-purple-600",
      icon: <Zap className="h-6 w-6" />,
    };

    // Create Elevate plan (premium)
    const elevatePlan: Plan = {
      id: "elevate",
      name: "Elevate",
      description: "Premium expert supervision",
      highlights: [
        "Advanced package including 2 live client session observations",
        "Extensive feedback and elevate practice to expert level",
        "Supports real-world application and confidence building",
        "Session duration ~75 mins",
      ],
      perSession: {}, // Will be populated from variants
      validityDays: {}, // Will be populated from variants
      gradient: "from-purple-600 via-pink-600 to-rose-700",
      icon: <TrendingUp className="h-6 w-6" />,
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
          sessionCount === 1 ? 15 : sessionCount * 45;
      }
    });

    // Set prices for each plan using the correct ratios for each session count
    Object.keys(basePrices).forEach((sessionCount) => {
      const count = parseInt(sessionCount);

      // Focus plan (base price)
      focusPlan.perSession[count] = basePrices[count];
      focusPlan.validityDays[count] = validityDays[count];

      // Flow plan (calculated based on actual ratios)
      flowPlan.perSession[count] = calculateSupervisedPlanPrice(
        basePrices[count],
        count,
        "flow",
      );
      flowPlan.validityDays[count] = validityDays[count];

      // Elevate plan (calculated based on actual ratios)
      elevatePlan.perSession[count] = calculateSupervisedPlanPrice(
        basePrices[count],
        count,
        "elevate",
      );
      elevatePlan.validityDays[count] = validityDays[count];
    });

    return [focusPlan, flowPlan, elevatePlan];
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
      planId === "focus" ? "Focus" : planId === "flow" ? "Flow" : "Elevate";
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
      courseType: selectedVariant.type,
    });

    // Call the original onBook callback
    onBook?.({
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
          <div className="animate-float-slow absolute -top-20 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-600/20 blur-3xl dark:from-emerald-700/15 dark:to-cyan-700/15" />
          <div className="animate-float-slower absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 blur-3xl dark:from-purple-700/15 dark:to-pink-700/15" />
          <div className="animate-float-medium absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-600/10 blur-2xl dark:from-blue-700/10 dark:to-indigo-800/10" />
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="mb-12 text-center">
            <div className="from-primary/10 to-accent/10 border-primary/20 mb-4 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-4 py-2">
              <Target className="text-primary h-4 w-4" />
              <span className="text-primary text-sm font-medium">
                Choose Your Supervision Plan
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Grow your skills. Build your confidence.
              <br />
              <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                Thrive as a therapist.
              </span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Select the number of sessions and supervision level that work best
              for you. You can always upgrade later.
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
              "mx-auto grid max-w-6xl gap-8 md:grid-cols-3",
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
                      Valid for {plan.validityDays[sessions] || 45} days
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
