import React from "react";
import { View, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

interface WavyDividerProps {
  color?: string;
  height?: number;
  flip?: boolean;
  style?: ViewStyle;
}

export function WavyDivider({
  color = "#faf7f2",
  height = 24,
  flip = false,
  style,
}: WavyDividerProps) {
  return (
    <View
      style={[
        {
          width: "100%",
          height,
          transform: flip ? [{ scaleY: -1 }] : [],
        },
        style,
      ]}
    >
      <Svg
        width="100%"
        height={height}
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
        fill="none"
      >
        <Path
          d="M0 24V12C40 4 80 0 120 4C160 8 200 16 240 16C280 16 320 8 360 4C380 2 400 4 400 4V24H0Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}
