// components/ThemeSwitcher.tsx — Wave A: light | dark only
import { View, Text } from "react-native";
import { Uniwind, useUniwind } from "uniwind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnimatedPressable } from "./AnimatedPressable";

const THEME_STORAGE_KEY = "@ascend_theme";

const themes = [
  { name: "light" as const, label: "Light" },
  { name: "dark" as const, label: "Dark" },
];

export const ThemeSwitcher = () => {
  const { theme } = useUniwind();
  const activeTheme = theme === "dark" ? "dark" : "light";

  const handleThemeChange = async (themeName: "light" | "dark") => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);
      Uniwind.setTheme(themeName);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <View className="mb-6">
      <Text className="text-text-muted mb-3 font-sans-medium text-[13px] uppercase tracking-wide">
        Appearance
      </Text>
      <View className="flex-row bg-surface-elevated p-1 rounded-lg">
        {themes.map((item) => {
          const active = activeTheme === item.name;
          return (
            <AnimatedPressable
              key={item.name}
              onPress={() => handleThemeChange(item.name)}
              className={`flex-1 py-3 rounded-md ${active ? "bg-surface" : ""}`}
            >
              <Text
                className={`text-center text-[14px] font-sans-semibold ${
                  active ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {item.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
};
