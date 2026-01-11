// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#27272a",
        },
        tabBarActiveTintColor: "#38e8ff",
        tabBarInactiveTintColor: "#71717a",
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
