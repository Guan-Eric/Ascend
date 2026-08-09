import { View, Text } from "react-native";
import { AnimatedPressable } from "../AnimatedPressable";

type Option<T extends string> = {
  value: T;
  label: string;
};

type SegmentControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: SegmentControlProps<T>) {
  return (
    <View
      className={`flex-row bg-surface-elevated p-1 rounded-lg ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <AnimatedPressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 py-2.5 rounded-md ${active ? "bg-surface" : ""}`}
          >
            <Text
              className={`text-center text-[14px] font-sans-semibold ${
                active ? "text-text-primary" : "text-text-muted"
              }`}
            >
              {option.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}
