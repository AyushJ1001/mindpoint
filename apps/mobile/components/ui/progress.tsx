import { View, type ViewProps } from "react-native";

export type ProgressProps = ViewProps & {
  value: number; // 0-100
  className?: string;
};

export function Progress({ value, className, ...props }: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <View
      className={`h-2.5 w-full overflow-hidden rounded-[999px] bg-secondary ${className ?? ""}`}
      {...props}
    >
      <View
        className="h-full rounded-[999px] bg-primary"
        style={{ width: `${clampedValue}%` }}
      />
    </View>
  );
}
