import { View, Text } from "react-native";
import { Star, Zap, Shield, Heart, TrendingUp } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@/components/ui/card";

const REASONS = [
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
];

export function WhyChoose() {
  return (
    <View className="mt-8">
      <View className="mb-2 flex-row items-center justify-center gap-2">
        <Star size={22} color="#4338ca" />
        <Text className="text-xl font-bold text-primary">
          Why Choose This Course?
        </Text>
      </View>
      <Text className="mb-5 text-center text-sm text-muted-foreground">
        Discover what makes this course unique and valuable
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {REASONS.map((reason) => (
          <Card
            key={reason.title}
            className="w-[47%] border-primary/20 bg-primary/5"
            style={{
              shadowColor: "#4338ca",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <LinearGradient
              colors={["#4338ca", "#7c3aed"]}
              style={{ marginBottom: 8, height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 }}
            >
              <reason.icon size={18} color="#ffffff" />
            </LinearGradient>
            <Text className="text-sm font-bold text-foreground">
              {reason.title}
            </Text>
            <Text className="mt-1 text-xs leading-4 text-muted-foreground">
              {reason.description}
            </Text>
          </Card>
        ))}
      </View>
    </View>
  );
}
