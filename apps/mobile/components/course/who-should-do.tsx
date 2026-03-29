import { View, Text } from "react-native";
import { Target } from "lucide-react-native";
import { Card } from "@/components/ui/card";

const TARGET_AUDIENCE = [
  {
    emoji: "\uD83C\uDF93",
    title: "Students & Graduates",
    description:
      "Looking to build a strong foundation in psychology and mental health practices.",
  },
  {
    emoji: "\uD83D\uDC68\u200D\u2695\uFE0F",
    title: "Healthcare Professionals",
    description:
      "Wanting to expand their knowledge and skills in mental health care.",
  },
  {
    emoji: "\uD83D\uDCBC",
    title: "Career Changers",
    description:
      "Seeking to transition into the mental health and wellness industry.",
  },
  {
    emoji: "\uD83E\uDDE0",
    title: "Psychology Enthusiasts",
    description:
      "Passionate about understanding human behavior and mental processes.",
  },
];

export function WhoShouldDo() {
  return (
    <View className="mt-8">
      <View className="mb-2 flex-row items-center justify-center gap-2">
        <Target size={22} color="#4338ca" />
        <Text className="text-xl font-bold text-primary">
          Who Should Do This Course?
        </Text>
      </View>
      <Text className="mb-5 text-center text-sm text-muted-foreground">
        Find out if this course is the perfect fit for your learning journey
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {TARGET_AUDIENCE.map((item) => (
          <Card
            key={item.title}
            className="w-[47%] border-primary/20 bg-primary/5"
            style={{
              shadowColor: "#4338ca",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-3xl mb-2">{item.emoji}</Text>
            <Text className="text-sm font-bold text-foreground">
              {item.title}
            </Text>
            <Text className="mt-1 text-xs leading-4 text-muted-foreground">
              {item.description}
            </Text>
          </Card>
        ))}
      </View>
    </View>
  );
}
