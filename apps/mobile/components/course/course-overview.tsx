import { View, Text } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CourseOverviewProps {
  description?: string;
}

/**
 * Parses a description string into structured blocks (paragraphs, bullet lists,
 * numbered lists) mirroring the web StructuredContent component.
 */
function renderStructuredContent(text: string) {
  const blocks = text.replace(/\r\n?/g, "\n").split(/\n{2,}/);

  return blocks.map((block, idx) => {
    const lines = block
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const isBulleted = lines.every((l) => /^[-*\u2022]\s+/.test(l));
    const isNumbered = lines.every((l) => /^\d+[.)]\s+/.test(l));

    if (isBulleted) {
      return (
        <View key={idx} className="gap-1.5 pl-2">
          {lines.map((l, i) => (
            <View key={i} className="flex-row gap-2">
              <Text className="text-muted-foreground">{"\u2022"}</Text>
              <Text className="flex-1 text-sm leading-relaxed text-foreground">
                {l.replace(/^[-*\u2022]\s+/, "")}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    if (isNumbered) {
      return (
        <View key={idx} className="gap-1.5 pl-2">
          {lines.map((l, i) => (
            <View key={i} className="flex-row gap-2">
              <Text className="text-muted-foreground">{i + 1}.</Text>
              <Text className="flex-1 text-sm leading-relaxed text-foreground">
                {l.replace(/^\d+[.)]\s+/, "")}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    return (
      <Text
        key={idx}
        className="text-sm leading-relaxed text-foreground"
      >
        {block}
      </Text>
    );
  });
}

export function CourseOverview({ description }: CourseOverviewProps) {
  if (!description) return null;

  return (
    <View className="mt-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-2xl font-bold text-primary">
            Course Overview
          </CardTitle>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            Comprehensive learning experience designed for your success
          </Text>
        </CardHeader>
        <CardContent>
          <View className="gap-4">
            {renderStructuredContent(description)}
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
