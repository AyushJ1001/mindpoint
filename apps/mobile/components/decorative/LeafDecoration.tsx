import React from "react";
import { type ViewStyle } from "react-native";
import Svg, { Path, G } from "react-native-svg";

type LeafVariant = 1 | 2 | 3;

interface LeafDecorationProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  variant?: LeafVariant;
  opacity?: number;
}

export function LeafDecoration({
  size = 48,
  color = "#5b7a5e",
  style,
  variant = 1,
  opacity = 0.2,
}: LeafDecorationProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      style={[{ opacity }, style]}
    >
      {variant === 1 && (
        <G>
          {/* Single elegant leaf with stem */}
          <Path
            d="M32 8C32 8 16 20 16 36C16 48 24 56 32 56C40 56 48 48 48 36C48 20 32 8 32 8Z"
            fill={color}
          />
          <Path
            d="M32 18C32 18 30 30 32 44"
            stroke="white"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.4}
          />
        </G>
      )}
      {variant === 2 && (
        <G>
          {/* Two small leaves branching */}
          <Path
            d="M28 56C28 56 28 32 28 20"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Path
            d="M28 28C28 28 14 18 10 12C16 14 28 20 28 28Z"
            fill={color}
          />
          <Path
            d="M28 40C28 40 42 30 46 24C40 26 28 32 28 40Z"
            fill={color}
          />
        </G>
      )}
      {variant === 3 && (
        <G>
          {/* Rounded monstera-style leaf */}
          <Path
            d="M32 8C20 16 12 28 14 42C16 52 24 58 34 56C44 54 52 44 50 32C48 20 38 10 32 8Z"
            fill={color}
          />
          <Path
            d="M32 16C30 26 28 36 30 48"
            stroke="white"
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.35}
          />
          <Path
            d="M30 30C24 26 18 28 14 32"
            stroke="white"
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.25}
          />
        </G>
      )}
    </Svg>
  );
}
