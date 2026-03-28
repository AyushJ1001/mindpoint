import { View, Text } from "react-native";
import { Target, CheckCircle } from "lucide-react-native";

const TARGET_AUDIENCE = [
  "Psychology students and graduates",
  "Mental health professionals seeking specialization",
  "Counselors and therapists in training",
  "HR professionals interested in employee wellness",
  "Social workers and community health workers",
  "Anyone passionate about mental health and well-being",
];

export function WhoShouldDo() {
  return (
    <View className="mt-6">
      <View className="mb-4 flex-row items-center gap-2">
        <Target size={20} color="#4338ca" />
        <Text className="text-lg font-semibold text-foreground">
          Who Should Enroll?
        </Text>
      </View>
      <View className="gap-2">
        {TARGET_AUDIENCE.map((item, index) => (
          <View key={index} className="flex-row items-start gap-3">
            <CheckCircle size={16} color="#059669" />
            <Text className="flex-1 text-sm text-foreground">{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
