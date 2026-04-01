import { View, Text, type ViewProps } from "react-native";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export type BadgeProps = ViewProps & {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary",
  secondary: "border border-border/70 bg-secondary",
  outline: "border border-border bg-transparent",
  destructive: "bg-destructive",
};

const textClasses: Record<BadgeVariant, string> = {
  default: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  destructive: "text-white",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  const isTextChild =
    typeof children === "string" || typeof children === "number";

  return (
    <View
      className={`self-start rounded-[999px] px-3.5 py-1.5 ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    >
      {isTextChild ? (
        <Text className={`text-xs font-medium ${textClasses[variant]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
