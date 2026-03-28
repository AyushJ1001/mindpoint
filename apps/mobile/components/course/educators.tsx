import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@/components/ui/card";
import { User, Users } from "lucide-react-native";

const EDUCATORS = [
  {
    name: "Ms. Kiranjot Kour, Chief Resource Faculty",
    role: "Counselling Psychologist",
  },
  {
    name: "Ms. Kashfiya Anam Khan, Head Resource Faculty",
    role: "Counselling Psychologist",
  },
  {
    name: "Ms. Gazala Patel, Senior Resource Faculty",
    role: "Counselling Psychologist",
  },
  {
    name: "Mr. Arjun Mehta, Guest Faculty",
    role: "Neuroscience Researcher",
  },
];

export function Educators() {
  return (
    <View className="mt-8">
      <View className="mb-2 flex-row items-center justify-center gap-2">
        <Users size={22} color="#4338ca" />
        <Text className="text-xl font-bold text-primary">
          Educators and Supervisors
        </Text>
      </View>
      <Text className="mb-5 text-center text-sm text-muted-foreground">
        Learn from experienced professionals in the field
      </Text>

      <View className="gap-3">
        {EDUCATORS.map((educator) => (
          <Card
            key={educator.name}
            className="flex-row items-center gap-3 border-primary/20"
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
              className="h-12 w-12 items-center justify-center rounded-full"
            >
              <User size={24} color="#ffffff" />
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">
                {educator.name}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {educator.role}
              </Text>
              <Text className="mt-0.5 text-[10px] leading-3 text-muted-foreground/70">
                Practical, culturally relevant training with engaging methods and
                real case insights.
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
