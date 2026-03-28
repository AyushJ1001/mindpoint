import { View, Text, Linking, Pressable } from "react-native";
import { Users, ExternalLink } from "lucide-react-native";
import { Card } from "@/components/ui/card";

export function CommunitiesSection() {
  return (
    <View className="mt-6">
      <View className="mb-4 flex-row items-center gap-2">
        <Users size={20} color="#4338ca" />
        <Text className="text-lg font-semibold text-foreground">
          Join Our Community
        </Text>
      </View>
      <Card>
        <Text className="text-sm text-muted-foreground">
          Connect with fellow learners, share insights, and grow together.
          Join our active community of psychology enthusiasts and mental
          health professionals.
        </Text>
      </Card>
    </View>
  );
}
