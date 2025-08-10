"use client";

import type React from "react";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

type Sessions = 1 | 4 | 7;

type Plan = {
  id: "connection" | "express";
  name: string;
  highlights: string[];
  perSession: Record<Sessions, number>;
  validityDays: Record<Sessions, number>;
  gradient: string;
  icon: React.ReactNode;
  description: string;
};

export default function ChoosePlan({
  onBook = () => {},
}: {
  onBook?: (payload: {
    planId: string;
    sessions: Sessions;
    total: number;
    perSession: number;
  }) => void;
}) {
  const [sessions, setSessions] = useState<Sessions>(1);
  const { ref, visible } = useInView<HTMLDivElement>();

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "connection",
        name: "Connection",
        description: "Premium therapy with senior experts",
        highlights: [
          "Connect with senior experts",
          "Get a therapist in 60 mins",
          "Validity adjusts with pack",
          "Session duration ~60 mins",
        ],
        perSession: { 1: 1799, 4: 1599, 7: 1499 },
        validityDays: { 1: 15, 4: 120, 7: 210 },
        gradient: "from-blue-600 via-purple-600 to-indigo-700",
        icon: <Sparkles className="h-6 w-6" />,
      },
      {
        id: "express",
        name: "Express",
        description: "Quick therapy at affordable rates",
        highlights: [
          "Start at lower prices",
          "Get a therapist in 24–36 hrs",
          "Validity adjusts with pack",
          "Session duration ~40 mins",
        ],
        perSession: { 1: 1299, 4: 1149, 7: 999 },
        validityDays: { 1: 10, 4: 120, 7: 210 },
        gradient: "from-emerald-500 via-teal-500 to-cyan-600",
        icon: <HeartHandshake className="h-6 w-6" />,
      },
    ],
    [],
  );

  const formatter = new Intl.NumberFormat("en-IN");

  const options: Sessions[] = [1, 4, 7];

  return (
    <section id="plans" className="scroll-mt-24">
      <div className="relative overflow-hidden">
        {/* Enhanced background with gradients */}
        <div className="from-background via-muted/20 to-background absolute inset-0 bg-gradient-to-br" />

        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float-slow absolute -top-20 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 blur-3xl" />
          <div className="animate-float-slower absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-600/20 blur-3xl" />
          <div className="animate-float-medium absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-pink-500/10 to-rose-600/10 blur-2xl" />
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
              {options.map((opt) => (
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
              "mx-auto grid max-w-5xl gap-8 md:grid-cols-2",
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              "transition-all duration-700",
            )}
          >
            {plans.map((plan, idx) => {
              const per = plan.perSession[sessions];
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
                      Valid for {plan.validityDays[sessions]} days
                    </div>
                    <Button
                      className={cn(
                        "rounded-xl bg-gradient-to-r font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl",
                        plan.gradient,
                      )}
                      onClick={() =>
                        onBook({
                          planId: plan.id,
                          sessions,
                          total,
                          perSession: per,
                        })
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
