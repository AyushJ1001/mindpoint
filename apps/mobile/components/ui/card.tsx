import React from "react";
import { View, Text, type ViewProps, type TextProps } from "react-native";

export function Card({
  className,
  children,
  ...props
}: ViewProps & { className?: string }) {
  return (
    <View
      className={`border-border/50 bg-card rounded-3xl border p-5 shadow-sm shadow-amber-900/5 ${className ?? ""}`}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: ViewProps & { className?: string }) {
  return (
    <View className={`mb-3.5 ${className ?? ""}`} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: TextProps & { className?: string }) {
  return (
    <Text
      className={`text-card-foreground text-lg leading-6 font-semibold ${className ?? ""}`}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: ViewProps & { className?: string }) {
  // Wrap bare text/number children in <Text> to prevent
  // "A text node cannot be a child of <View>" errors.
  const safeChildren = React.Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number" ? (
      <Text>{child}</Text>
    ) : (
      child
    ),
  );

  return (
    <View className={className ?? ""} {...props}>
      {safeChildren}
    </View>
  );
}
