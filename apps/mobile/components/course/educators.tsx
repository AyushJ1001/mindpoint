import { View, Text } from "react-native";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react-native";

const EDUCATORS = [
  { name: "Dr. Aishwarya Singh", role: "Clinical Psychologist" },
  { name: "Dr. Priya Mehta", role: "Counselling Psychologist" },
  { name: "Dr. Neha Sharma", role: "Rehabilitation Psychologist" },
  { name: "Dr. Kavita Joshi", role: "Child Psychologist" },
];

export function Educators() {
  return (
    <View className="mt-6">
      <Text className="mb-4 text-lg font-semibold text-foreground">
        Meet Your Educators
      </Text>
      <View className="gap-3">
        {EDUCATORS.map((educator) => (
          <Card key={educator.name} className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-[999px] bg-primary/10">
              <User size={24} color="#4338ca" />
            </View>
            <View>
              <Text className="text-sm font-semibold text-foreground">
                {educator.name}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {educator.role}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
