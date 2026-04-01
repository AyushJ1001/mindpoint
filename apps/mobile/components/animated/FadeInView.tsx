import React from "react";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import type { ViewStyle } from "react-native";

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down";
  style?: ViewStyle;
  className?: string;
}

export function FadeInView({
  children,
  delay = 0,
  duration = 400,
  direction = "up",
  style,
  className,
}: FadeInViewProps) {
  const entering =
    direction === "up"
      ? FadeInUp.delay(delay).duration(duration).springify().damping(18)
      : FadeInDown.delay(delay).duration(duration).springify().damping(18);

  return (
    <Animated.View entering={entering} style={style} className={className}>
      {children}
    </Animated.View>
  );
}
