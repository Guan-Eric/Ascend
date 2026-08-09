import { ReactNode } from "react";
import { Text, View } from "react-native";
import { AnimatedPressable } from "../AnimatedPressable";

type Variant = "primary" | "ghost" | "link";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  className?: string;
  leading?: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary: "bg-primary py-4 rounded-lg",
  ghost: "border border-border py-4 rounded-lg bg-transparent",
  link: "py-3",
};

const labelClass: Record<Variant, string> = {
  primary: "text-background text-center text-base",
  ghost: "text-text-primary text-center text-base",
  link: "text-primary text-center text-[15px]",
};

export function Button({
  label,
  onPress,
  disabled,
  variant = "primary",
  className = "",
  leading,
}: ButtonProps) {
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      className={`${variantClass[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      <View className="flex-row items-center justify-center">
        {leading}
        <Text
          className={`${labelClass[variant]} ${leading ? "ml-2" : ""}`}
          style={{
            fontFamily:
              variant === "link" ? "DMSans_500Medium" : "DMSans_600SemiBold",
          }}
        >
          {label}
        </Text>
      </View>
    </AnimatedPressable>
  );
}
