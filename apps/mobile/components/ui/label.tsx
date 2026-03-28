import { Text, type TextProps } from "react-native";

export type LabelProps = TextProps & {
  className?: string;
  children: React.ReactNode;
};

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <Text
      className={`mb-1.5 text-sm font-medium text-foreground ${className ?? ""}`}
      {...props}
    >
      {children}
    </Text>
  );
}
