import React from "react";
import { View, Text } from "react-native";
import { LeafDecoration } from "./decorative/LeafDecoration";

interface PersonalizedGreetingProps {
  firstName?: string | null;
  isSignedIn?: boolean;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function PersonalizedGreeting({
  firstName,
  isSignedIn,
}: PersonalizedGreetingProps) {
  const timeGreeting = getTimeGreeting();

  let greeting: string;
  if (firstName) {
    greeting = `${timeGreeting}, ${firstName}!`;
  } else if (isSignedIn) {
    greeting = `${timeGreeting}!`;
  } else {
    greeting = "Hello there!";
  }

  return (
    <View className="flex-row items-center gap-2">
      <LeafDecoration size={28} color="#ffffff" variant={2} opacity={0.5} />
      <Text className="text-lg font-bold text-primary-foreground/90">
        {greeting}
      </Text>
    </View>
  );
}
