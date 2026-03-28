import { View, Text } from "react-native";
import { Lightbulb, Globe, BookOpen, Award, Heart, Users, Target, Zap } from "lucide-react-native";
import { Card } from "@/components/ui/card";

const REASONS = [
  { icon: BookOpen, title: "Expert Curriculum", description: "Designed by industry professionals" },
  { icon: Globe, title: "Global Recognition", description: "Internationally valued credentials" },
  { icon: Users, title: "Community Support", description: "Join a network of learners" },
  { icon: Award, title: "Certification", description: "Earn recognized certificates" },
  { icon: Heart, title: "Practical Skills", description: "Hands-on learning approach" },
  { icon: Target, title: "Career Growth", description: "Advance your professional journey" },
];

export function WhyChoose() {
  return (
    <View className="mt-6">
      <View className="mb-4 flex-row items-center gap-2">
        <Lightbulb size={20} color="#4338ca" />
        <Text className="text-lg font-semibold text-foreground">
          Why Choose Mind Point?
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-3">
        {REASONS.map((reason) => (
          <Card key={reason.title} className="w-[47%]">
            <reason.icon size={24} color="#4338ca" />
            <Text className="mt-2 text-sm font-semibold text-foreground">
              {reason.title}
            </Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">
              {reason.description}
            </Text>
          </Card>
        ))}
      </View>
    </View>
  );
}
