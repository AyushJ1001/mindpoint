import { View, Text } from "react-native";
import { CheckCircle, BookOpen, Clock, Award } from "lucide-react-native";
import { Card } from "@/components/ui/card";

interface CourseModulesSectionProps {
  learningOutcomes?: Array<{ icon: string; title: string }>;
}

export function CourseModulesSection({
  learningOutcomes,
}: CourseModulesSectionProps) {
  if (!learningOutcomes || learningOutcomes.length === 0) return null;

  return (
    <View className="mt-6">
      <Text className="mb-4 text-lg font-semibold text-foreground">
        What You'll Learn
      </Text>
      <View className="gap-2">
        {learningOutcomes.map((outcome, index) => (
          <View key={index} className="flex-row items-start gap-3">
            <CheckCircle size={18} color="#059669" />
            <Text className="flex-1 text-sm leading-5 text-foreground">
              {outcome.title}
            </Text>
          </View>
        ))}
      </View>

      {/* Info cards */}
      <View className="mt-6 gap-3">
        <Card className="flex-row items-center gap-3">
          <View className="rounded-lg bg-primary/10 p-2">
            <BookOpen size={20} color="#4338ca" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              Comprehensive Curriculum
            </Text>
            <Text className="text-xs text-muted-foreground">
              Structured modules designed by industry experts
            </Text>
          </View>
        </Card>
        <Card className="flex-row items-center gap-3">
          <View className="rounded-lg bg-primary/10 p-2">
            <Clock size={20} color="#4338ca" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              Flexible Learning
            </Text>
            <Text className="text-xs text-muted-foreground">
              Learn at your own pace with guided support
            </Text>
          </View>
        </Card>
        <Card className="flex-row items-center gap-3">
          <View className="rounded-lg bg-primary/10 p-2">
            <Award size={20} color="#4338ca" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              Recognized Certification
            </Text>
            <Text className="text-xs text-muted-foreground">
              Earn a certificate upon successful completion
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );
}
