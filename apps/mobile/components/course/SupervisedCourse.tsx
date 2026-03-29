import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "react-use-cart";
import { LinearGradient } from "expo-linear-gradient";
import type { PublicCourse } from "@mindpoint/backend";
import { Card } from "@/components/ui/card";
import {
  Target,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react-native";

// Price ratios based on actual pricing table
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

  if (planId === "focus") return basePrice;
  if (planId === "flow") {
    const ratio =
      priceRatios[sessionCount as keyof typeof priceRatios]?.flow;
    return ratio ? Math.round(basePrice * ratio) : basePrice;
  }
  if (planId === "elevate") {
    const ratio =
      priceRatios[sessionCount as keyof typeof priceRatios]?.elevate;
    return ratio ? Math.round(basePrice * ratio) : basePrice;
  }
  return basePrice;
};

type Plan = {
  id: "focus" | "flow" | "elevate";
  name: string;
  description: string;
  highlights: string[];
  perSession: Record<number, number>;
  validityDays: Record<number, number>;
  gradientColors: [string, string, string];
  icon: typeof Target;
};

interface SupervisedCourseProps {
  course: PublicCourse;
  variants?: PublicCourse[];
}

export default function SupervisedCourse({
  course,
  variants = [],
}: SupervisedCourseProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const sessionOptions = useMemo(() => {
    const sessionCounts = new Set<number>();
    variants.forEach((variant) => {
      const sessionCount = (variant as any).sessions;
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

  const [sessions, setSessions] = useState(sessionOptions[0] || 1);

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
      gradientColors: ["#10b981", "#14b8a6", "#06b6d4"],
      icon: Target,
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
      gradientColors: ["#3b82f6", "#6366f1", "#9333ea"],
      icon: Zap,
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
      gradientColors: ["#9333ea", "#ec4899", "#f43f5e"],
      icon: TrendingUp,
    };

    const basePrices: Record<number, number> = {};
    const validityDays: Record<number, number> = {};

    variants.forEach((variant) => {
      const sessionCount = (variant as any).sessions;
      if (sessionCount && typeof sessionCount === "number") {
        const pricePerSession = Math.round(variant.price / sessionCount);
        basePrices[sessionCount] = pricePerSession;
        validityDays[sessionCount] = sessionCount === 1 ? 15 : sessionCount * 45;
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
    selectedSessions: number,
    total: number,
  ) => {
    const selectedVariant = variants.find((variant) => {
      return (variant as any).sessions === selectedSessions;
    });

    if (!selectedVariant) return;

    const seatsLeft = Math.max(
      0,
      (selectedVariant.capacity ?? 0) - (selectedVariant.enrolledCount ?? 0),
    );
    if ((selectedVariant.capacity ?? 0) === 0 || seatsLeft === 0) return;

    const planName =
      planId === "focus" ? "Focus" : planId === "flow" ? "Flow" : "Elevate";
    const cartItemName = `${selectedVariant.name} - ${planName} (${selectedSessions} ${selectedSessions === 1 ? "session" : "sessions"})`;

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

    router.push("/(tabs)/cart");
  };

  return (
    <View>
      {/* Course Title */}
      <View className="mt-4 mb-2">
        <Text className="text-3xl font-bold text-primary">{course.name}</Text>
      </View>

      {/* Header */}
      <View className="mt-4 mb-2">
        <Text className="mb-1 text-center text-xl font-bold text-foreground">
          Grow your skills. Build your confidence.
        </Text>
        <Text className="mb-1 text-center text-xl font-bold text-primary">
          Thrive as a therapist.
        </Text>
        <Text className="mb-3 text-center text-sm text-muted-foreground">
          Select the number of sessions and supervision level that work best for
          you. You can always upgrade later.
        </Text>

        {/* Session selector */}
        <View className="flex-row flex-wrap items-center justify-center gap-2 rounded-2xl bg-secondary/50 p-2">
          {sessionOptions.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => setSessions(opt)}
              className={`min-w-[70px] items-center rounded-xl px-3 py-2.5 ${
                sessions === opt ? "bg-primary" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  sessions === opt
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {opt} {opt === 1 ? "session" : "sessions"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Plan Cards */}
      <View className="mt-4 gap-4">
        {plans.map((plan) => {
          const per = plan.perSession[sessions];
          if (!per) return null;

          const total = per * sessions;
          const billed =
            sessions === 1
              ? `Billed for ${sessions} session at \u20B9${formatter.format(total)}`
              : `Billed for ${sessions} sessions at \u20B9${formatter.format(total)}`;
          const PlanIcon = plan.icon;

          return (
            <Card
              key={plan.id}
              className="overflow-hidden border-0"
              style={{
                shadowColor: plan.gradientColors[0],
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {/* Gradient header */}
              <LinearGradient
                colors={plan.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingHorizontal: 16, paddingVertical: 16 }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <PlanIcon size={20} color="#ffffff" />
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-white">
                      {plan.name}
                    </Text>
                    <Text className="text-xs text-white/80">
                      {plan.description}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Content */}
              <View className="p-4">
                <View className="mb-4 gap-2.5">
                  {plan.highlights.map((h) => (
                    <View key={h} className="flex-row items-start gap-2.5">
                      <View className="mt-0.5 h-4 w-4 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 size={10} color="#4338ca" />
                      </View>
                      <Text className="flex-1 text-xs text-muted-foreground">
                        {h}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="mb-3">
                  <View className="flex-row items-baseline gap-2">
                    <Text className="text-3xl font-bold text-primary">
                      {"\u20B9"}{formatter.format(per)}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      per session
                    </Text>
                  </View>
                  <View className="mt-1.5 rounded-lg bg-secondary/50 px-3 py-1.5">
                    <Text className="text-xs text-muted-foreground">
                      {billed}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="rounded-full bg-secondary/50 px-3 py-1">
                    <Text className="text-xs text-muted-foreground">
                      Valid for {plan.validityDays[sessions] || 45} days
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      handleStartSession(plan.id, sessions, total)
                    }
                    style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                  >
                    <LinearGradient
                      colors={plan.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}
                    >
                      <Text className="text-sm font-semibold text-white">
                        Start Session
                      </Text>
                      <ArrowUpRight
                        size={16}
                        color="#ffffff"
                        style={{ marginLeft: 4 }}
                      />
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
}
