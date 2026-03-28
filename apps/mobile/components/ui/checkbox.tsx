import { Pressable, View } from "react-native";
import { Check } from "lucide-react-native";

export type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  className,
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      className={`h-5 w-5 items-center justify-center rounded border ${
        checked ? "border-primary bg-primary" : "border-border bg-card"
      } ${disabled ? "opacity-50" : ""} ${className ?? ""}`}
    >
      {checked && <Check size={14} color="#f5f7fa" strokeWidth={3} />}
    </Pressable>
  );
}
