import { forwardRef } from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type ViewStyle,
} from "react-native";

type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export type ButtonProps = PressableProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-primary shadow-sm shadow-indigo-300/40",
  secondary: "border border-border/70 bg-secondary",
  outline: "border border-border bg-transparent",
  ghost: "bg-transparent",
  destructive: "bg-destructive",
};

const variantTextClasses: Record<ButtonVariant, string> = {
  default: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  destructive: "text-destructive-foreground",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "rounded-xl px-5 py-3",
  sm: "rounded-lg px-3 py-2",
  lg: "rounded-2xl px-8 py-4",
  icon: "rounded-xl p-3",
};

const sizeTextClasses: Record<ButtonSize, string> = {
  default: "text-sm",
  sm: "text-xs",
  lg: "text-base",
  icon: "text-sm",
};

export const Button = forwardRef<any, ButtonProps>(
  (
    { variant = "default", size = "default", children, className, ...props },
    ref,
  ) => {
    return (
      <Pressable
        ref={ref}
        className={`flex-row items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${className ?? ""}`}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : props.disabled ? 0.5 : 1,
        })}
        {...props}
      >
        {typeof children === "string" ? (
          <Text
            className={`font-semibold ${variantTextClasses[variant]} ${sizeTextClasses[size]}`}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  },
);

Button.displayName = "Button";
