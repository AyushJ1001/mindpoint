import { useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { Dialog } from "./dialog";

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = {
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={`border-border/80 bg-input flex-row items-center justify-between rounded-xl border px-4 py-3 ${className ?? ""}`}
      >
        <Text
          className={`text-sm ${selectedOption ? "text-foreground" : "text-muted-foreground"}`}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <ChevronDown size={16} color="#8a8279" />
      </Pressable>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <Text className="text-card-foreground mb-4 text-lg font-semibold">
          {placeholder}
        </Text>
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onValueChange(item.value);
                setOpen(false);
              }}
              className={`rounded-xl px-4 py-3 ${
                item.value === value ? "bg-primary/12" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm ${
                  item.value === value
                    ? "text-primary font-semibold"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </Dialog>
    </>
  );
}
