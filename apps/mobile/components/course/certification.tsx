import { View, Text } from "react-native";
import { Award } from "lucide-react-native";
import { Card } from "@/components/ui/card";

interface CertificationProps {
  courseType?: string;
}

export function Certification({ courseType }: CertificationProps) {
  return (
    <View className="mt-6">
      <Card className="bg-primary/5 border-primary/20">
        <View className="items-center gap-3">
          <View className="rounded-[999px] bg-primary/10 p-3">
            <Award size={32} color="#5b7a5e" />
          </View>
          <Text className="text-lg font-semibold text-foreground">
            Earn Your Certificate
          </Text>
          <Text className="text-center text-sm text-muted-foreground">
            Upon successful completion of this{" "}
            {courseType?.replace("-", " ") || "course"}, you will receive a
            professional certificate recognized across the industry.
          </Text>
        </View>
      </Card>
    </View>
  );
}
