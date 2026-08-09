import { View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenProps = ViewProps & {
  className?: string;
  padded?: boolean;
  edges?: ("top" | "bottom")[];
  children: React.ReactNode;
};

export function Screen({
  children,
  className = "",
  padded = true,
  edges = ["top"],
  style,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = edges.includes("top") ? insets.top + 16 : undefined;
  const paddingBottom = edges.includes("bottom") ? insets.bottom + 16 : undefined;

  return (
    <View
      className={`flex-1 bg-background ${padded ? "px-6" : ""} ${className}`}
      style={[{ paddingTop, paddingBottom }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
