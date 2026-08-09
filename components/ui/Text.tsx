import { Text as RNText, TextProps as RNTextProps, StyleSheet } from "react-native";

type Variant = "display" | "title" | "heading" | "body" | "muted" | "caption" | "stat";

const variantClass: Record<Variant, string> = {
  display: "text-[32px] text-text-primary",
  title: "text-[22px] text-text-primary",
  heading: "text-[17px] text-text-primary",
  body: "text-[15px] text-text-primary",
  muted: "text-[15px] text-text-muted",
  caption: "text-[13px] text-text-muted",
  stat: "text-[28px] text-text-primary",
};

const variantFont: Record<Variant, string> = {
  display: "DMSans_600SemiBold",
  title: "DMSans_600SemiBold",
  heading: "DMSans_600SemiBold",
  body: "DMSans_400Regular",
  muted: "DMSans_400Regular",
  caption: "DMSans_500Medium",
  stat: "DMSans_700Bold",
};

export type TextProps = RNTextProps & {
  variant?: Variant;
  className?: string;
};

export function Text({
  variant = "body",
  className = "",
  style,
  ...props
}: TextProps) {
  return (
    <RNText
      className={`${variantClass[variant]} ${className}`}
      style={[{ fontFamily: variantFont[variant] }, style]}
      {...props}
    />
  );
}

/** Apply DM Sans on raw RN Text via style helpers */
export const fontStyles = StyleSheet.create({
  regular: { fontFamily: "DMSans_400Regular" },
  medium: { fontFamily: "DMSans_500Medium" },
  semibold: { fontFamily: "DMSans_600SemiBold" },
  bold: { fontFamily: "DMSans_700Bold" },
});
