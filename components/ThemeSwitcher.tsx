import { View, Pressable, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Uniwind, useUniwind } from "uniwind";

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
                    <Pressable
                        onPress={() =>
                            Uniwind.setTheme(
                                item.name as
                                | "coffee"
                                | "light"
                                | "dark"
                                | "matcha"
                                | "ube"
                                | "zen"
                                | "system"
                            )
                        }
                        className={`  px-5 py-4 rounded-xl mr-3 items-center justify-center
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
                    </Pressable>
                )}
                keyExtractor={(item) => item.name}
            />
        </View>
    );
};
