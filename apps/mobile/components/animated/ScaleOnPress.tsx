import React from "react";
import { Pressable, type PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScaleOnPressProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
  scaleValue?: number;
}

export function ScaleOnPress({
  children,
  className,
  scaleValue = 0.97,
  onPressIn,
  onPressOut,
  ...props
}: ScaleOnPressProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      className={className}
      style={animatedStyle}
      onPressIn={(e) => {
        scale.value = withSpring(scaleValue, {
          damping: 15,
          stiffness: 300,
        });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 300,
        });
        onPressOut?.(e);
      }}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
