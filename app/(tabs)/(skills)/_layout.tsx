import { Stack } from "expo-router";

export default function SkillsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="skill-details" />
      <Stack.Screen name="exercise-details" />
    </Stack>
  );
}
