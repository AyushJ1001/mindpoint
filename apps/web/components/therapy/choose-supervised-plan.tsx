"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";
import type { PublicCourse } from "@mindpoint/backend";
import { getEnrolledCount } from "@/lib/course-enrollment";
import { ScrollReveal } from "@/components/ScrollReveal";

// Configuration constants
// Based on the actual pricing table:
// Focus: 1 session ₹800, 2 sessions ₹1500, 4 sessions ₹2800, 6 sessions ₹3900
// Flow: 1 session ₹1100, 2 sessions ₹2100, 4 sessions ₹4000, 6 sessions ₹5700
// Elevate: 1 session ₹1500, 2 sessions ₹2900, 4 sessions ₹5600, 6 sessions ₹8100

const calculateSupervisedPlanPrice = (
  basePrice: number,
  sessionCount: number,
  planId: string,
): number => {
  const priceRatios = {
    1: { flow: 1100 / 800, elevate: 1500 / 800 },
    2: { flow: 2100 / 1500, elevate: 2900 / 1500 },
    4: { flow: 4000 / 2800, elevate: 5600 / 2800 },
    6: { flow: 5700 / 3900, elevate: 8100 / 3900 },
  };

  if (planId === "focus") {
    return basePrice;
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
  icon: React.ReactNode;
  description: string;
};

interface ChooseSupervisedPlanProps {
  course: PublicCourse;
  variants: PublicCourse[];
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
      perSession: {},
      validityDays: {},
      icon: <Target className="h-5 w-5" />,
    };

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
      perSession: {},
      validityDays: {},
      icon: <Zap className="h-5 w-5" />,
    };

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
      perSession: {},
      validityDays: {},
      icon: <TrendingUp className="h-5 w-5" />,
    };

    const basePrices: Record<number, number> = {};
    const validityDays: Record<number, number> = {};

    variants.forEach((variant) => {
      const sessionCount = variant.sessions;
      if (sessionCount && typeof sessionCount === "number") {
        const pricePerSession = Math.round(variant.price / sessionCount);
        basePrices[sessionCount] = pricePerSession;
        validityDays[sessionCount] =
          sessionCount === 1 ? 15 : sessionCount * 45;
      }
    });

    Object.keys(basePrices).forEach((sessionCount) => {
      const count = parseInt(sessionCount);

      focusPlan.perSession[count] = basePrices[count];
      focusPlan.validityDays[count] = validityDays[count];

      flowPlan.perSession[count] = calculateSupervisedPlanPrice(
        basePrices[count],
        count,
        "flow",
      );
      flowPlan.validityDays[count] = validityDays[count];

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
      planId === "focus" ? "Focus" : planId === "flow" ? "Flow" : "Elevate";
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

    onBook?.({ planId, sessions, total, perSession });
    router.push("/cart");
  };

  return (
    <section id="plans" className="section-padding scroll-mt-24">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              Pick the supervision depth that matches your growth.
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-lg">
              Select the number of sessions and supervision level that work best
              for you. You can always upgrade later.
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
                      Valid for {plan.validityDays[sessions] || 45} days
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
