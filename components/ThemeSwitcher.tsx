// components/ThemeSwitcher.tsx - Updated with persistence
import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Uniwind, useUniwind } from "uniwind";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnimatedPressable } from "./AnimatedPressable";

const THEME_STORAGE_KEY = '@ascend_theme';

export const ThemeSwitcher = () => {
    const { theme } = useUniwind();

    const themes = [
        { name: "light", label: "Light", icon: "☀️" },
        { name: "dark", label: "Dark", icon: "🌙" },
        { name: "matcha", label: "Matcha", icon: "🍵" },
        { name: "ube", label: "Ube", icon: "🍠" },
        { name: "zen", label: "Zen", icon: "🪷" },
        { name: "coffee", label: "Coffee", icon: "☕" },
    ];

    const activeTheme = theme;

    const handleThemeChange = async (themeName: string) => {
        try {
            // Save to storage
            await AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);

            // Apply theme
            Uniwind.setTheme(
                themeName as "coffee" | "light" | "dark" | "matcha" | "ube" | "zen" | "system"
            );
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    return (
        <View className="card-frosted p-6 rounded-3xl mb-4 shadow-elevated">
            <Text className="text-text-secondary mb-4 font-medium text-sm uppercase">
                Theme
            </Text>

            <FlashList
                horizontal
                data={themes}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <AnimatedPressable
                        onPress={() => handleThemeChange(item.name)}
                        className={`px-5 py-4 rounded-xl mr-3 items-center justify-center
              ${activeTheme === item.name ? "bg-primary" : "bg-surface border border-border"}`}
                    >
                        <Text
                            className={`text-2xl mb-1 ${activeTheme === item.name ? "text-white" : "text-text-primary"
                                }`}
                        >
                            {item.icon}
                        </Text>
                        <Text
                            className={`text-xs font-semibold ${activeTheme === item.name ? "text-white" : "text-text-primary"
                                }`}
                        >
                            {item.label}
                        </Text>
                    </AnimatedPressable>
                )}
                keyExtractor={(item) => item.name}
            />
        </View>
    );
};