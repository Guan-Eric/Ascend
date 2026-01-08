import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#27272a",
        },
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "#71717a",
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(skills)"
        options={{
          title: "Skills",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(strength)"
        options={{
          title: "Strength",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(ai)"
        options={{
          title: "AI Coach",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
