import { Stack } from "expo-router";

export default function StrengthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="path-details" />
      <Stack.Screen name="exercise-details" />
    </Stack>
  );
}