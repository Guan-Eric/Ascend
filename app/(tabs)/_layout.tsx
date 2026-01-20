// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUniwind } from "uniwind";

const tabThemeColors: Record<string, {
  background: string;
  border: string;
  active: string;
  inactive: string;
}> = {
  dark: {
    background: "#0b1220",
    border: "#27272a",
    active: "#38e8ff",
    inactive: "#71717a",
  },
  light: {
    background: "#ffffff",
    border: "#dbe2f3",
    active: "#2563eb", // softer blue for light
    inactive: "#64748b",
  },
  zen: {
    background: "#ffffff",
    border: "#e5e7eb",
    active: "#2563eb",
    inactive: "#64748b",
  },
  matcha: {
    background: "#f3f7f2",
    border: "#c7d3c0",
    active: "#3f7d4f",
    inactive: "#6b7280",
  },
  ube: {
    background: "#2a1938",
    border: "#3a2550",
    active: "#c084fc",
    inactive: "#a1a1aa",
  },
  coffee: {
    background: "#1e1a16",
    border: "#3b2f24",
    active: "#d6a26a",
    inactive: "#9ca3af",
  },
};

export default function TabsLayout() {
  const { theme } = useUniwind();
  const tabColors = tabThemeColors[theme] ?? tabThemeColors.dark;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabColors.background,
          borderTopColor: tabColors.border,
        },
        tabBarActiveTintColor: tabColors.active,
        tabBarInactiveTintColor: tabColors.inactive,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-variant-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(skills)"
        options={{
          title: "Skills",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="human-handsup"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(strength)"
        options={{
          title: "Strength",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="arm-flex-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(ai)"
        options={{
          title: "AI Coach",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="brain" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
