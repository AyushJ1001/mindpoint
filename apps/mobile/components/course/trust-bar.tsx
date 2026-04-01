import { View, Text } from "react-native";
import { Shield, Lock, Users, Award } from "lucide-react-native";

const TRUST_ITEMS = [
  { icon: Shield, label: "Certified", color: "#5b7a5e" },
  { icon: Lock, label: "Secure", color: "#059669" },
  { icon: Users, label: "Community", color: "#2563eb" },
  { icon: Award, label: "Quality", color: "#d97706" },
];

export function TrustBar() {
  return (
    <View className="mt-6 flex-row justify-between rounded-xl bg-secondary p-4">
      {TRUST_ITEMS.map((item) => (
        <View key={item.label} className="items-center gap-1">
          <item.icon size={20} color={item.color} />
          <Text className="text-xs font-medium text-secondary-foreground">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
