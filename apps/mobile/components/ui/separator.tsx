import { View, type ViewProps } from "react-native";

export type SeparatorProps = ViewProps & {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function Separator({
  orientation = "horizontal",
  className,
  ...props
}: SeparatorProps) {
  return (
    <View
      className={`bg-border ${orientation === "horizontal" ? "h-px w-full" : "h-full w-px"} ${className ?? ""}`}
      {...props}
    />
  );
}
