import React from "react";
import { type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

type BlobVariant = 1 | 2 | 3;

interface BlobShapeProps {
  size?: number;
  color?: string;
  opacity?: number;
  variant?: BlobVariant;
  style?: ViewStyle;
}

export function BlobShape({
  size = 120,
  color = "#e8f0e8",
  opacity = 0.3,
  variant = 1,
  style,
}: BlobShapeProps) {
  const paths: Record<BlobVariant, string> = {
    1: "M44.5 3.5C58.3 8.1 68.5 22.3 69.8 37.5C71.1 52.7 63.5 68.9 50.2 74.2C36.9 79.5 18 73.9 7.7 62C-2.6 50.1-4.3 31.9 4.4 19.5C13.1 7.1 30.7-1.1 44.5 3.5Z",
    2: "M38.9 2.4C51.1 5.8 56.6 21.6 62.8 35.9C69 50.2 75.8 63 68.8 71C61.8 79 41 82.2 26.4 76.3C11.8 70.4 3.4 55.4 1 40.6C-1.4 25.8 2.2 11.2 11.6 5C21-1.2 26.7-1 38.9 2.4Z",
    3: "M41.4 1.5C53.8 4.9 65.4 16.5 68.6 30.4C71.8 44.3 66.6 60.5 54.8 69.4C43 78.3 24.6 79.9 13.2 71.6C1.8 63.3-2.6 45.1 1.4 31.2C5.4 17.3 17.8 7.7 29 3.2C40.2-1.3 50.2-0.7 41.4 1.5Z",
  };

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 75 80"
      fill="none"
      style={[{ opacity }, style]}
    >
      <Path d={paths[variant]} fill={color} />
    </Svg>
  );
}
