import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "react-use-cart";
import { LinearGradient } from "expo-linear-gradient";
import type { PublicCourse } from "@mindpoint/backend";
import { showRupees, getCoursePrice } from "@mindpoint/domain/pricing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Award,
  Clock,
  BookOpen,
  Zap,
  Shield,
  Globe,
  Heart,
  Brain,
  MessageCircle,
  Star,
} from "lucide-react-native";

// Price ratios based on actual pricing table
const calculatePlanPrice = (
  basePrice: number,
  sessionCount: number,
  planId: string,
): number => {
  const priceRatios = {
    1: { express: 950 / 600, connection: 1400 / 600 },
    3: { express: 2700 / 1650, connection: 4050 / 1650 },
    6: { express: 5100 / 3000, connection: 7800 / 3000 },
  };

  if (planId === "spark") return basePrice;
  if (planId === "express") {
    const ratio =
      priceRatios[sessionCount as keyof typeof priceRatios]?.express;
    return ratio ? Math.round(basePrice * ratio) : basePrice;
  }
  if (planId === "connection") {
    const ratio =
      priceRatios[sessionCount as keyof typeof priceRatios]?.connection;
    return ratio ? Math.round(basePrice * ratio) : basePrice;
  }
  return basePrice;
};

type Plan = {
  id: "spark" | "express" | "connection";
  name: string;
  description: string;
  highlights: string[];
  perSession: Record<number, number>;
  validityDays: Record<number, number>;
  gradientColors: [string, string, string];
  icon: typeof Flame;
};

interface TherapyCourseProps {
  course: PublicCourse;
  variants?: PublicCourse[];
}

export default function TherapyCourse({
  course,
  variants = [],
}: TherapyCourseProps) {
  const router = useRouter();
  const { addItem } = useCart();

  // Get unique session counts from variants
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
      sessionCounts.add(3);
      sessionCounts.add(6);
    }
    return Array.from(sessionCounts).sort((a, b) => a - b);
  }, [variants]);

  const [sessions, setSessions] = useState(sessionOptions[0] || 1);

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
      gradientColors: ["#f43f5e", "#f97316", "#f59e0b"],
      icon: Flame,
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
      gradientColors: ["#10b981", "#14b8a6", "#06b6d4"],
      icon: HeartHandshake,
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
      gradientColors: ["#2563eb", "#9333ea", "#4f46e5"],
      icon: Sparkles,
    };

    const basePrices: Record<number, number> = {};
    const validityDays: Record<number, number> = {};

    variants.forEach((variant) => {
      const sessionCount = (variant as any).sessions;
      if (sessionCount && typeof sessionCount === "number") {
        const pricePerSession = Math.round(variant.price / sessionCount);
        basePrices[sessionCount] = pricePerSession;
        validityDays[sessionCount] = sessionCount === 1 ? 10 : sessionCount * 30;
      }
    });

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
      planId === "connection"
        ? "Connection"
        : planId === "spark"
          ? "Spark"
          : "Express";
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

      {/* Session Selector */}
      <View className="mt-4 mb-2">
        <Text className="mb-3 text-center text-base text-muted-foreground">
          Select the number of sessions that work best for you.
        </Text>
        <View className="flex-row items-center justify-center gap-2 rounded-2xl bg-secondary/50 p-2">
          {sessionOptions.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => setSessions(opt)}
              className={`min-w-[80px] items-center rounded-xl px-4 py-2.5 ${
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
                {/* Highlights */}
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

                {/* Pricing */}
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

                {/* Footer */}
                <View className="flex-row items-center justify-between">
                  <View className="rounded-full bg-secondary/50 px-3 py-1">
                    <Text className="text-xs text-muted-foreground">
                      Valid for {plan.validityDays[sessions] || 30} days
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

      {/* Why Choose The Mind Point for Therapy */}
      <View className="mt-8">
        <View className="mb-2 flex-row items-center justify-center gap-2">
          <Star size={16} color="#4338ca" />
          <Text className="text-xs font-medium text-primary">
            Trusted by 1000+ Clients
          </Text>
        </View>
        <Text className="mb-2 text-center text-2xl font-bold text-foreground">
          Why Choose{" "}
          <Text className="text-primary">The Mind Point</Text> for Therapy?
        </Text>
        <Text className="mb-6 text-center text-sm text-muted-foreground">
          Experience professional therapy with a difference. We combine
          expertise, compassion, and innovation to provide you with the best
          mental health support.
        </Text>

        <View className="gap-3">
          {WHY_CHOOSE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-0 bg-card"
                style={{
                  shadowColor: "#4338ca",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <View className="flex-row items-start gap-3 p-4">
                  <LinearGradient
                    colors={["#4338ca", "#7c3aed"]}
                    style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 12 }}
                  >
                    <Icon size={20} color="#ffffff" />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground">
                      {item.title}
                    </Text>
                    <Text className="mt-1 text-xs leading-4 text-muted-foreground">
                      {item.description}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Trust Indicators */}
        <LinearGradient
          colors={["#4338ca10", "#7c3aed10"]}
          style={{ marginTop: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderRadius: 16, padding: 20 }}
        >
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary">1000+</Text>
            <Text className="text-xs text-muted-foreground">Happy Clients</Text>
          </View>
          <View className="h-8 w-px bg-border" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary">4.9</Text>
            <Text className="text-xs text-muted-foreground">
              Client Rating
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Therapy Benefits */}
      <View className="mt-8">
        <Text className="mb-2 text-center text-2xl font-bold text-primary">
          Therapy Benefits
        </Text>
        <Text className="mb-6 text-center text-sm text-muted-foreground">
          How therapy can support your mental health and well-being
        </Text>
        <View className="gap-3">
          {THERAPY_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title} className="p-4">
                <View className="flex-row items-center gap-3 mb-2">
                  <Icon size={22} color="#4338ca" />
                  <Text className="text-base font-bold text-foreground">
                    {benefit.title}
                  </Text>
                </View>
                <Text className="text-xs leading-4 text-muted-foreground">
                  {benefit.description}
                </Text>
              </Card>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const WHY_CHOOSE_ITEMS = [
  {
    icon: Award,
    title: "Licensed Professionals",
    description:
      "Our therapists are certified mental health professionals with extensive training and experience in evidence-based therapeutic approaches.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description:
      "Appointments will be booked based on your and therapist convenience. No more waiting weeks for appointments or rushing to make it on time.",
  },
  {
    icon: BookOpen,
    title: "Evidence-Based Approaches",
    description:
      "We use scientifically proven therapeutic methods including CBT, DBT, and positive psychology to ensure effective treatment outcomes.",
  },
  {
    icon: Zap,
    title: "Affordable Pricing",
    description:
      "Quality therapy shouldn't break the bank. Our transparent pricing starts from just \u20B9600 per session with bulk discounts available.",
  },
  {
    icon: Shield,
    title: "Confidential & Secure",
    description:
      "Your privacy is our priority. All sessions are completely confidential and conducted through secure platforms compliant with Indian data protection laws.",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description:
      "Access therapy from anywhere in the world. Our online platform connects you with qualified therapists regardless of your location.",
  },
];

const THERAPY_BENEFITS = [
  {
    icon: Heart,
    title: "Emotional Support",
    description:
      "Receive compassionate support and guidance to navigate life's challenges and improve your emotional well-being.",
  },
  {
    icon: Brain,
    title: "Coping Strategies",
    description:
      "Learn effective coping mechanisms and strategies to manage stress, anxiety, and other mental health challenges.",
  },
  {
    icon: MessageCircle,
    title: "Self-Understanding",
    description:
      "Gain deeper insights into your thoughts, feelings, and behaviors to foster personal growth and self-awareness.",
  },
  {
    icon: Shield,
    title: "Safe Space",
    description:
      "Experience a confidential, non-judgmental environment where you can freely express yourself and work through challenges.",
  },
];
