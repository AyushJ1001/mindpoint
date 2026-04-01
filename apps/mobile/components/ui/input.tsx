import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";

export type InputProps = TextInputProps & {
  className?: string;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={`border-border/80 bg-input text-foreground rounded-xl border px-4 py-3 text-sm ${className ?? ""}`}
        placeholderTextColor="#8a8279"
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
