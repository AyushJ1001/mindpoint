import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";

export type TextareaProps = TextInputProps & {
  className?: string;
};

export const Textarea = forwardRef<TextInput, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        className={`min-h-[100px] rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground ${className ?? ""}`}
        placeholderTextColor="#8a8279"
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
